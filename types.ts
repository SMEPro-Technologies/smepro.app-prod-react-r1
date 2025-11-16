// This file contains the core type definitions for the application.
// It lives at the root level (not under src) so imports are consistent across the app.

import React from 'react';

// FIX: Restore global JSX augmentation. This is critical for TypeScript to recognize
// standard HTML elements like 'div', 'button', etc. Without this, the JSX.IntrinsicElements
// interface can be overwritten, leading to compilation errors across the app.
declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {
      // Custom elements can be defined here if needed in the future.
      // This structure ensures we are AUGMENTING React's types, not REPLACING them.
    }
  }
}

// -----------------------------
// Subscription & Plans
// -----------------------------

export type BasePlan = 'solo' | 'business';
export type LevelUpPackage = 'solo-plus' | 'business-adv' | 'enterprise-oem';
export type SubscriptionPlanId = BasePlan | LevelUpPackage;

/**
 * Structured subscription plan details used in PlanComparisonTable and PlansPage.
 * Provides full metadata for each plan, including pricing and Stripe price IDs.
 */
export interface SubscriptionPlanDetails {
  id: SubscriptionPlanId;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  isFeatured: boolean;
  priceIds: {
    monthly: string;
    annual: string;
  } | null;
}

export interface Subscription {
  id: string;
  planType: BasePlan;
  levelUpPackage: LevelUpPackage | null;
  status: 'active' | 'trialing' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  trialStart?: string;
  trialEnd?: string;
}

// -----------------------------
// Marketing & Context
// -----------------------------

export type MarketingPage =
  | 'home'
  | 'features'
  | 'how-it-works'
  | 'plans'
  | 'safe-ai'
  | 'smepro-review'
  | 'contact'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'acceptable-use';

export type CurrentView = MarketingPage | 'app';

export type ResponseMode =
  | 'default'
  | 'quick-insight'
  | 'solution'
  | 'cited-facts'
  | 'legal'
  | 'overview'
  | 'synopsis'
  | 'generate-code';

export type Theme = 'light' | 'dark';

export type SmeHelperContext =
  | 'APP_HOME'
  | 'APP_FEATURES'
  | 'APP_HOW_IT_WORKS'
  | 'APP_PLANS'
  | 'APP_SAFE_AI'
  | 'SME_SELECTOR'
  | 'CHAT_WINDOW'
  | 'CHAT_INPUT'
  | 'CHAT_HEADER'
  | 'SME_PANEL'
  | 'VAULT'
  | 'VAULT_ITEMS'
  | 'VAULT_ANALYZER'
  | 'DASHBOARD'
  | 'DASHBOARD_USAGE'
  | 'DASHBOARD_SAFETY'
  | 'SME_WORKBENCH'
  | 'APP_CONTACT'
  | 'APP_PRIVACY'
  | 'APP_TERMS'
  | 'APP_ACCEPTABLE_USE';

// -----------------------------
// Functions & Capabilities
// -----------------------------

export const functionNames = [
  'generateCode',
  'selfCheck',
  'runTerminal',
  'automateBrowser',
  'latestModels',
  'apiKeyOptional',
  'aiImaging',
  'searchStripeDocs',
  'reportStripeUsage',
  'scaffoldStripeEndpoint',
] as const;

export type FunctionName = typeof functionNames[number];

export const focusTypes = [
  'Social Media',
  'TikTok',
  'Digital Marketing',
  'OnlyFans',
  'Instagram',
  'Facebook',
  'Content Automation',
] as const;

export type FocusType = typeof focusTypes[number];

export interface DynamicCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// -----------------------------
// User & Profile
// -----------------------------

export interface Quota {
  limit: number;
  used: number;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  subscription: Subscription;
  quotas: {
    vaultStorage: Quota; // in GB
    analyzerActions: Quota; // monthly actions
    aiBandwidth: Quota; // abstract units
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  subscription: Subscription;
  signupDate: string;
}

// -----------------------------
// Chat & Workshop
// -----------------------------

export interface SmeConfig {
  industry: string;
  subType: string;
  segment: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export interface TextPart {
  text: string;
}

export type Part = InlineDataPart | TextPart;

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  parts?: Part[];
  timestamp: string;
  senderName?: string;
}

export interface ChatSession {
  sessionId: string;
  smeConfigs: SmeConfig[];
  messages: ChatMessage[];
  accountType: SubscriptionPlanId;
  participants: { name: string; isSme?: boolean }[];
  enabledFunctions: Partial<Record<FunctionName, boolean>>;
  focus?: FocusType;
  dynamicCapabilities?: DynamicCapability[];
}

export interface WorkshopData {
  objective: string;
  agenda: string;
  backstory: string;
  useCases: string;
  attendees?: SmeConfig[];
}

// -----------------------------
// Vault & Assets
// -----------------------------

export interface VaultItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  builderReady?: boolean;
  sourceText?: string;
  analysisType?: 'red' | 'blue' | 'green';
}

export interface WorkbenchAsset {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'search-result';
  content: string; // URL for image/video/search, text content otherwise
  createdAt: string;
}

// -----------------------------
// Connectors & Support
// -----------------------------

export interface ApiConnector {
  id: string;
  provider: 'openai' | 'grok' | 'aws';
  apiKey: string;
  lastSync: string | null;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  subject: string;
  submittedAt: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

export interface SuggestedSme {
  config: SmeConfig;
  reason: string;
}

// -----------------------------
// Miscellaneous
// -----------------------------

export interface AiPlatform {
  name: string;
  category: string;
  claimToFame: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
