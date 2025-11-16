-- =====================================================================
-- SMEPro.app Production Database Initialization
-- =====================================================================
-- Compatible with PostgreSQL 13+
-- Provides core schema for users, plans, prices, subscriptions, usage,
-- invoices, and webhook events with referential integrity and indexes.
-- =====================================================================

-- ---------- SAFETY ----------
BEGIN;

-- ---------- EXTENSIONS ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- ENUMS ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle') THEN
    CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');
  END IF;
END$$;

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS app_user (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              CITEXT UNIQUE NOT NULL,
  name               TEXT,
  company            TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user (email);

-- ---------- PLANS ----------
CREATE TABLE IF NOT EXISTS plan (
  id            TEXT PRIMARY KEY,                     -- 'solo', 'business', 'solo-plus', 'business-adv', 'enterprise-oem'
  name          TEXT NOT NULL,
  is_addon      BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- PRICES (STRIPE) ----------
CREATE TABLE IF NOT EXISTS stripe_price (
  id                 TEXT PRIMARY KEY,                -- Stripe Price ID (price_xxx)
  plan_id            TEXT NOT NULL REFERENCES plan (id) ON DELETE CASCADE,
  billing_cycle      billing_cycle NOT NULL,
  unit_amount_cents  INTEGER NOT NULL CHECK (unit_amount_cents >= 0),
  currency           TEXT NOT NULL DEFAULT 'usd',
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, billing_cycle)
);

-- ---------- SUBSCRIPTIONS ----------
CREATE TABLE IF NOT EXISTS subscription (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id            UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
  base_plan_id           TEXT REFERENCES plan (id) ON DELETE SET NULL,
  addon_plan_id          TEXT REFERENCES plan (id) ON DELETE SET NULL,
  status                 subscription_status NOT NULL,
  billing_cycle          billing_cycle NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  trial_start            TIMESTAMPTZ,
  trial_end              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (addon_plan_id IS NULL) OR (addon_plan_id IN ('solo-plus','business-adv'))
  )
);

CREATE INDEX IF NOT EXISTS idx_subscription_user ON subscription (app_user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON subscription (status);

-- ---------- INVOICES ----------
CREATE TABLE IF NOT EXISTS invoice (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id        UUID NOT NULL REFERENCES subscription (id) ON DELETE CASCADE,
  stripe_invoice_id      TEXT UNIQUE NOT NULL,
  paid                   BOOLEAN NOT NULL DEFAULT FALSE,
  amount_due_cents       INTEGER NOT NULL DEFAULT 0,
  amount_paid_cents      INTEGER NOT NULL DEFAULT 0,
  currency               TEXT NOT NULL DEFAULT 'usd',
  period_start           TIMESTAMPTZ,
  period_end             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_subscription ON invoice (subscription_id);

-- ---------- USAGE METERING ----------
CREATE TABLE IF NOT EXISTS usage_event (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id       UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
  subscription_id   UUID NOT NULL REFERENCES subscription (id) ON DELETE CASCADE,
  metric            TEXT NOT NULL,                  -- e.g., 'ai_tasks', 'vault_storage_gb'
  quantity          INTEGER NOT NULL CHECK (quantity >= 0),
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user_time ON usage_event (app_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_sub_metric ON usage_event (subscription_id, metric);

-- Optional monthly aggregates (fast dashboards)
CREATE TABLE IF NOT EXISTS usage_monthly (
  app_user_id     UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscription (id) ON DELETE CASCADE,
  metric          TEXT NOT NULL,
  year_month      TEXT NOT NULL,                    -- '2025-11'
  total_quantity  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (subscription_id, metric, year_month)
);

-- ---------- WEBHOOK EVENT AUDIT LOG ----------
CREATE TABLE IF NOT EXISTS stripe_webhook_event (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id   TEXT UNIQUE NOT NULL,
  type              TEXT NOT NULL,                  -- e.g., 'invoice.payment_succeeded'
  payload           JSONB NOT NULL,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed         BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_type_time ON stripe_webhook_event (type, received_at DESC);

-- ---------- SEED PLANS ----------
INSERT INTO plan (id, name, is_addon, is_featured)
VALUES
  ('solo',           'SMEPro Solo',          FALSE, FALSE),
  ('business',       'SMEPro Business',      FALSE, TRUE),
  ('solo-plus',      'Solo+ (Addon)',        TRUE,  FALSE),
  ('business-adv',   'Business Adv (Addon)', TRUE,  FALSE),
  ('enterprise-oem', 'Enterprise OEM',       TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

-- ---------- SEED PRICES (replace ids + cents with live values) ----------
-- Solo
INSERT INTO stripe_price (id, plan_id, billing_cycle, unit_amount_cents, currency)
VALUES
  ('price_live_solo_monthly',  'solo',      'monthly', 2500, 'usd'),
  ('price_live_solo_annual',   'solo',      'annual',  2000, 'usd')
ON CONFLICT (id) DO NOTHING;

-- Business
INSERT INTO stripe_price (id, plan_id, billing_cycle, unit_amount_cents, currency)
VALUES
  ('price_live_biz_monthly',   'business',  'monthly', 5500, 'usd'),
  ('price_live_biz_annual',    'business',  'annual',  4400, 'usd')
ON CONFLICT (id) DO NOTHING;

-- Solo+ Addon
INSERT INTO stripe_price (id, plan_id, billing_cycle, unit_amount_cents, currency)
VALUES
  ('price_live_soloplus_monthly', 'solo-plus', 'monthly', 4500, 'usd'),
  ('price_live_soloplus_annual',  'solo-plus', 'annual',  3600, 'usd')
ON CONFLICT (id) DO NOTHING;

-- Business Adv Addon
INSERT INTO stripe_price (id, plan_id, billing_cycle, unit_amount_cents, currency)
VALUES
  ('price_live_bizadv_monthly', 'business-adv', 'monthly', 9500, 'usd'),
  ('price_live_bizadv_annual',  'business-adv', 'annual',  7600, 'usd')
ON CONFLICT (id) DO NOTHING;

-- Enterprise OEM (pricing negotiated, typically no public price)
-- You can omit or set placeholder; keep inactive by default
INSERT INTO stripe_price (id, plan_id, billing_cycle, unit_amount_cents, currency, active)
VALUES
  ('price_live_enterprise_placeholder', 'enterprise-oem', 'monthly', 0, 'usd', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ---------- TRIGGERS ----------
-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscription_touch ON subscription;
CREATE TRIGGER trg_subscription_touch
BEFORE UPDATE ON subscription
FOR EACH ROW
EXECUTE PROCEDURE touch_updated_at();

DROP TRIGGER IF EXISTS trg_user_touch ON app_user;
CREATE TRIGGER trg_user_touch
BEFORE UPDATE ON app_user
FOR EACH ROW
EXECUTE PROCEDURE touch_updated_at();

-- ---------- COMMIT ----------
COMMIT;
