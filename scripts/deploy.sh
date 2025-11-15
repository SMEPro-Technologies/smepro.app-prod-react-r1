#!/usr/bin/env bash
set -euo pipefail

# ====== AUTO CREATE GCP PROJECT ======
ORG_ID="${ORG_ID:-}"              # optional if you have an org
BILLING_ACCOUNT="${BILLING_ACCOUNT:-}"  # optional if you have billing

PROJECT_NAME="smepro-app-prod-release-1$(date +%Y%m%d%H%M)"
REGION="us-central1"
BACKEND_SERVICE="smepro-backend-release-1"
FRONTEND_SERVICE="smepro-frontend-release-1"

echo "Creating new GCP project: $PROJECT_NAME"
if [[ -n "$ORG_ID" && -n "$BILLING_ACCOUNT" ]]; then
  gcloud projects create "$PROJECT_NAME" --set-as-default \
    --organization="$ORG_ID" --billing-account="$BILLING_ACCOUNT"
else
  gcloud projects create "$PROJECT_NAME" --set-as-default
  echo "Reminder: link billing manually if BILLING_ACCOUNT not provided."
fi

gcloud config set project "$PROJECT_NAME"

# Enable required APIs
gcloud services enable run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# ====== AUTO CREATE CLOUD SQL INSTANCE ======
DB_INSTANCE="smepro-db-release-1-$(date +%Y%m%d%H%M)"
DB_USER="smepro_user"
DB_PASS="Reagan@90"   # fixed password per request
DB_NAME="smepro_db"

echo "Creating Cloud SQL Postgres instance: $DB_INSTANCE"
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="$REGION"

gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_PASS"
gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@/${DB_NAME}?host=/cloudsql/${PROJECT_NAME}:${REGION}:${DB_INSTANCE}"

# ====== STRIPE SECRETS (export before running) ======
# export STRIPE_SECRET_KEY="sk_live_..."
# export STRIPE_PUBLISHABLE_KEY="pk_live_..."
# export STRIPE_WEBHOOK_SECRET="whsec_..."
# export STRIPE_ADMIN_KEY="rk_live_..."
# export PRICE_SOLO_BASE="price_..."
# export PRICE_SOLO_PLUS="price_..."
# export PRICE_SOLO_PREMIUM="price_..."
# export PRICE_BUSINESS_BASE="price_..."
# export PRICE_BUSINESS_PLUS="price_..."
# export PRICE_BUSINESS_PREMIUM="price_..."

required_vars=(STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET STRIPE_ADMIN_KEY PRICE_SOLO_BASE PRICE_SOLO_PLUS PRICE_SOLO_PREMIUM PRICE_BUSINESS_BASE PRICE_BUSINESS_PLUS PRICE_BUSINESS_PREMIUM)
for v in "${required_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "Missing required env var: $v"
    exit 1
  fi
done

# ====== STORE SECRETS IN SECRET MANAGER ======
declare -A secrets=(
  [SECRET_KEY]="$(openssl rand -hex 32)"
  [STRIPE_SECRET_KEY]="$STRIPE_SECRET_KEY"
  [STRIPE_PUBLISHABLE_KEY]="$STRIPE_PUBLISHABLE_KEY"
  [STRIPE_WEBHOOK_SECRET]="$STRIPE_WEBHOOK_SECRET"
  [STRIPE_ADMIN_KEY]="$STRIPE_ADMIN_KEY"
  [PRICE_SOLO_BASE]="$PRICE_SOLO_BASE"
  [PRICE_SOLO_PLUS]="$PRICE_SOLO_PLUS"
  [PRICE_SOLO_PREMIUM]="$PRICE_SOLO_PREMIUM"
  [PRICE_BUSINESS_BASE]="$PRICE_BUSINESS_BASE"
  [PRICE_BUSINESS_PLUS]="$PRICE_BUSINESS_PLUS"
  [PRICE_BUSINESS_PREMIUM]="$PRICE_BUSINESS_PREMIUM"
  [DATABASE_URL]="$DATABASE_URL"
)

for name in "${!secrets[@]}"; do
  val="${secrets[$name]}"
  if ! gcloud secrets describe "$name" >/dev/null 2>&1; then
    printf "%s" "$val" | gcloud secrets create "$name" --data-file=-
  else
    printf "%s" "$val" | gcloud secrets versions add "$name" --data-file=-
  fi
done

# Grant Cloud Run service account access
SA="${PROJECT_NAME}@appspot.gserviceaccount.com"
for name in "${!secrets[@]}"; do
  gcloud secrets add-iam-policy-binding "$name" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor"
done

# ====== BUILD & DEPLOY BACKEND ======
gcloud builds submit --tag gcr.io/"$PROJECT_NAME"/smepro-backend:latest backend
gcloud run deploy "$BACKEND_SERVICE" \
  --image gcr.io/"$PROJECT_NAME"/smepro-backend:latest \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances "${PROJECT_NAME}:${REGION}:${DB_INSTANCE}" \
  --set-secrets SECRET_KEY=SECRET_KEY:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_ADMIN_KEY=STRIPE_ADMIN_KEY:latest,PRICE_SOLO_BASE=PRICE_SOLO_BASE:latest,PRICE_SOLO_PLUS=PRICE_SOLO_PLUS:latest,PRICE_SOLO_PREMIUM=PRICE_SOLO_PREMIUM:latest,PRICE_BUSINESS_BASE=PRICE_BUSINESS_BASE:latest,PRICE_BUSINESS_PLUS=PRICE_BUSINESS_PLUS:latest,PRICE_BUSINESS_PREMIUM=PRICE_BUSINESS_PREMIUM:latest,DATABASE_URL=DATABASE_URL:latest

BACKEND_URL="$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format='value(status.url)')"
echo "Backend deployed at: $BACKEND_URL"

# ====== BUILD & DEPLOY FRONTEND ======
pushd frontend
npm ci && npm run build
docker build -t gcr.io/"$PROJECT_NAME"/smepro-frontend:latest .
gcloud builds submit --tag gcr.io/"$PROJECT_NAME"/smepro-frontend:latest .
gcloud run deploy "$FRONTEND_SERVICE" \
  --image gcr.io/"$PROJECT_NAME"/smepro-frontend:latest \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets VITE_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest \
  --set-env-vars VITE_API_BASE_URL="$BACKEND_URL"
popd

FRONTEND_URL="$(gcloud run services describe "$FRONTEND_SERVICE" --region "$REGION" --format='value(status.url)')"
echo "Frontend deployed at: $FRONTEND_URL"

# ====== STRIPE WEBHOOK REGISTRATION ======
echo "Register Stripe webhook endpoint to: ${BACKEND_URL}/webhooks/stripe"
echo "Subscribe to: invoice.payment_succeeded, customer.subscription.deleted, payment_intent.payment_failed"
echo "Update STRIPE_WEBHOOK_SECRET in Secret Manager with the signing secret from Stripe."
