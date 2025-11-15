// This file contains the core type definitions for the application.

import React from 'react';

export type BasePlan = 'solo' | 'business';
export type LevelUpPackage = 'solo-plus' | 'business-adv' | 'enterprise-oem';
export type SubscriptionPlan = 'solo' | 'solo-plus' | 'business' | 'business-adv' | 'enterprise-oem';
export type MarketingPage = 'home' | 'features' | 'how-it-works' | 'plans' | 'safe-ai' | 'smepro-review' | 'contact' | 'privacy-policy' | 'terms-of-service' | 'acceptable-use';
export type CurrentView = MarketingPage | 'app';
export type ResponseMode = 'default' | 'quick-insight' | 'solution' | 'cited-facts' | 'legal' | 'overview' | 'synopsis' | 'generate-code';
// FIX: Added missing Theme type definition.
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
    // FIX: Added missing SME_WORKBENCH context
    | 'SME_WORKBENCH'
    | 'APP_CONTACT'
    | 'APP_PRIVACY'
    | 'APP_TERMS'
    | 'APP_ACCEPTABLE_USE';


// FIX: Added 'aiImaging' to the list of supported function names.
export const functionNames = [
    'generateCode',
    'selfCheck',
    'runTerminal',
    'automateBrowser',
    'latestModels',
    'apiKeyOptional',
    'aiImaging'
] as const;

export type FunctionName = typeof functionNames[number];

export const focusTypes = ['Social Media', 'TikTok', 'Digital Marketing', 'OnlyFans', 'Instagram', 'Facebook', 'Content Automation'] as const;
export type FocusType = typeof focusTypes[number];

export interface DynamicCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
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
  senderName?: string; // The user who sent the message
}

export interface ChatSession {
  sessionId: string;
  smeConfigs: SmeConfig[];
  messages: ChatMessage[];
  accountType: SubscriptionPlan;
  participants: { name: string; isSme?: boolean }[];
  enabledFunctions: Partial<Record<FunctionName, boolean>>;
  focus?: FocusType;
  dynamicCapabilities?: DynamicCapability[];
}

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

export interface ApiConnector {
  id: string;
  provider: 'openai' | 'grok' | 'aws';
  apiKey: string; 
  lastSync: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  subscription: Subscription;
  signupDate: string;
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

export interface WorkshopData {
  objective: string;
  agenda: string;
  backstory: string;
  useCases: string;
  attendees?: SmeConfig[];
}

export interface AiPlatform {
  name: string;
  category: string;
  claimToFame: string;
}

// FIX: Added missing types for SME Workbench
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface WorkbenchAsset {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'search-result';
  content: string; // URL for image/video/search, text content otherwise
  createdAt: string;
}