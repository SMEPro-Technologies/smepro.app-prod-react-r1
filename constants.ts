// ============================================================================
// SMEPro.app Production Constants
// Centralized configuration for domains, API endpoints, Stripe integration,
// and environment flags. Import from anywhere in the app for consistency.
// ============================================================================

// -----------------------------
// Environment Flags
// -----------------------------
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const APP_ENV = process.env.REACT_APP_ENV || 'development'; // 'production' | 'staging' | 'development'

// -----------------------------
// Domains
// -----------------------------
export const DOMAIN_MAIN = 'https://smepro.app';              // Marketing / product site
export const DOMAIN_API = 'https://api.smepro.app';           // Backend API + webhooks
export const DOMAIN_PAY = 'https://pay.smepro.app';           // Stripe hosted flows (Checkout, Customer Portal)
export const DOMAIN_CLOUD_RUN = 'https://smepro-app-prod-617852789136.us-west1.run.app'; // Raw Cloud Run URL (internal fallback)

// -----------------------------
// Stripe Integration
// -----------------------------
export const STRIPE_PUBLISHABLE_KEY =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_xxx'; // Replace with live publishable key

// Webhook endpoint (backend handles this, not frontend, but useful for docs/UI)
export const STRIPE_WEBHOOK_ENDPOINT = `${DOMAIN_API}/webhook`;

// -----------------------------
// Subscription Plans
// -----------------------------
export const PLAN_IDS = {
  SOLO: 'solo',
  BUSINESS: 'business',
  SOLO_PLUS: 'solo-plus',
  BUSINESS_ADV: 'business-adv',
  ENTERPRISE_OEM: 'enterprise-oem',
} as const;

// Stripe Price IDs (replace placeholders with live IDs from Dashboard)
export const STRIPE_PRICE_IDS = {
  [PLAN_IDS.SOLO]: {
    monthly: 'price_live_solo_monthly',
    annual: 'price_live_solo_annual',
  },
  [PLAN_IDS.BUSINESS]: {
    monthly: 'price_live_biz_monthly',
    annual: 'price_live_biz_annual',
  },
  [PLAN_IDS.SOLO_PLUS]: {
    monthly: 'price_live_soloplus_monthly',
    annual: 'price_live_soloplus_annual',
  },
  [PLAN_IDS.BUSINESS_ADV]: {
    monthly: 'price_live_bizadv_monthly',
    annual: 'price_live_bizadv_annual',
  },
  [PLAN_IDS.ENTERPRISE_OEM]: null, // Negotiated pricing
};

// -----------------------------
// UI / Styling
// -----------------------------
export const FEATURED_PLAN_ID = PLAN_IDS.BUSINESS; // Highlighted in PlanComparisonTable

// -----------------------------
// API Endpoints
// -----------------------------
export const ENDPOINTS = {
  CREATE_SUBSCRIPTION: `${DOMAIN_API}/create-subscription`,
  REPORT_USAGE: `${DOMAIN_API}/report-usage`,
  CUSTOMER_PORTAL: `${DOMAIN_API}/customer-portal`,
};
