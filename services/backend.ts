import { UserProfile, VaultItem, SubscriptionPlan, Quota, Subscription, BasePlan, LevelUpPackage } from '../types';
import { configService } from './configService';
import { generateId } from '../constants';

const USER_PROFILE_KEY = 'smeProUserProfile';
const VAULT_ITEMS_KEY = 'smeProVaultItems';
const VAULT_CATEGORIES_KEY = 'smeProVaultCategories';

// This helper function derives the effective plan used for quotas and feature flags.
export const getEffectivePlan = (subscription: Subscription): SubscriptionPlan => {
    if (subscription.levelUpPackage === 'solo-plus' && subscription.planType === 'solo') {
        return 'solo-plus';
    }
    if (subscription.levelUpPackage === 'business-adv' && subscription.planType === 'business') {
        return 'business-adv';
    }
    if (subscription.levelUpPackage === 'enterprise-oem') {
        return 'enterprise-oem';
    }
    return subscription.planType;
};

export const getSubscriptionParts = (plan: SubscriptionPlan): { planType: BasePlan, levelUpPackage: LevelUpPackage | null } => {
    switch(plan) {
        case 'solo':
            return { planType: 'solo', levelUpPackage: null };
        case 'solo-plus':
            return { planType: 'solo', levelUpPackage: 'solo-plus' };
        case 'business':
            return { planType: 'business', levelUpPackage: null };
        case 'business-adv':
            return { planType: 'business', levelUpPackage: 'business-adv' };
        case 'enterprise-oem':
            // Enterprise can be an add-on to any plan, but for this model, we'll anchor it to business
            return { planType: 'business', levelUpPackage: 'enterprise-oem' };
        default:
            // Fallback to the simplest plan
            return { planType: 'solo', levelUpPackage: null };
    }
};

const BASE_QUOTAS: Record<SubscriptionPlan, UserProfile['quotas']> = {
    'solo': {
        vaultStorage: { limit: 1, used: Math.random() * 0.5 },
        analyzerActions: { limit: 50, used: Math.floor(Math.random() * 10) },
        aiBandwidth: { limit: 50, used: Math.floor(Math.random() * 10) }
    },
    'business': {
        vaultStorage: { limit: 10, used: Math.random() * 2 },
        analyzerActions: { limit: 200, used: Math.floor(Math.random() * 40) },
        aiBandwidth: { limit: 200, used: Math.floor(Math.random() * 40) }
    },
    'solo-plus': { // solo + solo+ level up
        vaultStorage: { limit: 6, used: Math.random() * 1 }, // 1 + 5
        analyzerActions: { limit: 200, used: Math.floor(Math.random() * 40) }, // 50 + 150
        aiBandwidth: { limit: 200, used: Math.floor(Math.random() * 40) } // 50 + 150
    },
    'business-adv': { // business + business adv level up
        vaultStorage: { limit: 60, used: Math.random() * 10 }, // 10 + 50
        analyzerActions: { limit: 700, used: Math.floor(Math.random() * 140) }, // 200 + 500
        aiBandwidth: { limit: 700, used: Math.floor(Math.random() * 140) } // 200 + 500
    },
    'enterprise-oem': {
        vaultStorage: { limit: 1024, used: Math.random() * 40 }, // Using 1TB as a mock for "Tiered TBs"
        analyzerActions: { limit: 100000, used: Math.floor(Math.random() * 2000) }, // Using a large number for "Unlimited"
        aiBandwidth: { limit: 100000, used: Math.floor(Math.random() * 2000) } // Using a large number for "Unlimited"
    }
};

// Mock backend service that uses localStorage
export const backend = {
  fetchUserProfile: async (): Promise<UserProfile | null> => {
    const profileJson = localStorage.getItem(USER_PROFILE_KEY);
    return profileJson ? JSON.parse(profileJson) : null;
  },

  saveUserProfile: async (profileData: Omit<UserProfile, 'quotas'> | UserProfile): Promise<UserProfile> => {
    let finalProfile: UserProfile;

    // Check if updating an existing profile (which includes quotas) or creating a new one.
    if ('quotas' in profileData && profileData.quotas) {
        // --- QUOTA UPDATE LOGIC ---
        // This block handles subscription changes for existing users.
        const profileToUpdate = profileData as UserProfile;
        
        // 1. Determine the new effective plan (e.g., 'solo-plus', 'business-adv').
        const effectivePlan = getEffectivePlan(profileToUpdate.subscription);
        
        // 2. Fetch the new quota LIMITS based on the effective plan.
        const newQuotas = BASE_QUOTAS[effectivePlan];
        
        // 3. Construct the updated profile.
        // The key is to apply the new limits while preserving the existing 'used' values.
        finalProfile = {
            ...profileToUpdate,
            quotas: {
                vaultStorage: { limit: newQuotas.vaultStorage.limit, used: profileToUpdate.quotas.vaultStorage.used },
                analyzerActions: { limit: newQuotas.analyzerActions.limit, used: profileToUpdate.quotas.analyzerActions.used },
                aiBandwidth: { limit: newQuotas.aiBandwidth.limit, used: profileToUpdate.quotas.aiBandwidth.used }
            }
        };
    } else {
        // --- NEW USER CREATION LOGIC ---
        // This block handles initial signup.
        const profileToCreate = profileData as Omit<UserProfile, 'quotas'>;
        const subscriptionWithStatus: Subscription = {
            id: generateId(),
            status: 'trialing',
            trialStart: new Date().toISOString(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            ...(profileToCreate.subscription as Omit<Subscription, 'id' | 'status'>)
        };
        const effectivePlan = getEffectivePlan(subscriptionWithStatus);
        
        // Assigns the initial quotas (limits and mock 'used' values) for the new user's plan.
        finalProfile = {
            ...profileToCreate,
            subscription: subscriptionWithStatus,
            quotas: BASE_QUOTAS[effectivePlan]
        };
    }
    
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(finalProfile));
    return finalProfile;
  },

  createPaymentIntent: async (data: { amount: number; currency: string; customerInfo: { name: string; email: string; } }): Promise<{ clientSecret: string | null; ephemeralKey: string | null; customerId: string | null; error?: string; }> => {
    console.log("--- SIMULATING PRODUCTION-READY PAYMENT INTENT CREATION ---");
    
    // Systematic issue detection: Simulate a server-side failure.
    if (Math.random() < 0.1) { // 10% chance of failure
        console.error("--- SIMULATING BACKEND FAILURE ---");
        console.error("Could not connect to Stripe, or an invalid request was made.");
        return Promise.resolve({ 
            clientSecret: null, 
            ephemeralKey: null, 
            customerId: null,
            error: "A server error occurred while trying to initialize payment. Please try again in a few moments."
        });
    }

    console.log("1. Frontend requests backend to create everything needed for Stripe Payment Element.");
    console.log("2. Backend receives payment info and customer details:", data);
    
    // In a real backend, you'd use the Stripe Node.js library:
    // const customer = await stripe.customers.create({ name: data.customerInfo.name, email: data.customerInfo.email });
    // const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: '2024-06-20' });
    // const paymentIntent = await stripe.paymentIntents.create({ 
    //   amount: data.amount, 
    //   currency: data.currency, 
    //   customer: customer.id, 
    //   automatic_payment_methods: { enabled: true } 
    // });

    const mockCustomerId = `cus_${generateId()}`;
    const mockEphemeralKey = `ek_live_${generateId()}`;
    const mockClientSecret = `pi_${generateId()}_secret_${generateId()}`;

    console.log("3. Backend creates a Stripe Customer:", mockCustomerId);
    console.log("4. Backend creates an Ephemeral Key for the customer:", mockEphemeralKey);
    console.log("5. Backend creates a PaymentIntent linked to the customer:", mockClientSecret);
    console.log("6. Backend returns all three secrets to the frontend. The PaymentElement will use the clientSecret to securely render the form.");
    
    return Promise.resolve({ 
        clientSecret: mockClientSecret,
        ephemeralKey: mockEphemeralKey,
        customerId: mockCustomerId,
    });
  },
  
  fetchVaultItems: async (): Promise<VaultItem[]> => {
    const itemsJson = localStorage.getItem(VAULT_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  },

  saveVaultItem: async (item: VaultItem): Promise<VaultItem> => {
    let items = await backend.fetchVaultItems();
    const existingIndex = items.findIndex((i: VaultItem) => i.id === item.id);
    if (existingIndex > -1) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(items));
    return item;
  },

  deleteVaultItem: async (itemId: string): Promise<void> => {
    let items = await backend.fetchVaultItems();
    items = items.filter((i: VaultItem) => i.id !== itemId);
    localStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(items));
  },
  
  fetchCategories: async (): Promise<string[]> => {
    const catsJson = localStorage.getItem(VAULT_CATEGORIES_KEY);
    if (catsJson) {
        return JSON.parse(catsJson);
    }
    // If no categories in local storage, fetch defaults from config
    let categories = await configService.fetchVaultCategories();
    // Ensure "SME KT" exists for the new feature
    if (!categories.includes("SME KT")) {
        categories.push("SME KT");
    }
    return categories;
  },
  
  saveCategories: async (categories: string[]): Promise<string[]> => {
    localStorage.setItem(VAULT_CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
  }
};