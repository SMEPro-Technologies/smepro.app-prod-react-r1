import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import { SubscriptionPlan, BasePlan, LevelUpPackage, Subscription } from '../../types';
import { PlusIcon, CheckIcon, LoadingIcon } from '../icons';
import { backend } from '../../services/backend';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Use the public key provided by the user for a production-ready setup.
const stripePromise = loadStripe('pk_live_51SRoz7Cr7Y6oWGTOW7LRIrkdqAafL3JR05CSReKRP89TEGDRq4A9gB14fddn21bbizvkDuSoV9hsVpZgTjB2p6my00lrRAeeQd');

interface SignupModalProps {
  planInfo: {
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'annual';
    price: number;
    priceId: string;
  };
  onConfirm: (
    signupData: { name: string; email: string; company: string },
    subscriptionInfoForMock: Omit<Subscription, 'id' | 'status' | 'trialStart' | 'trialEnd'>
  ) => void;
  onClose: () => void;
}

const levelUpOptions: Partial<Record<SubscriptionPlan, { id: SubscriptionPlan; name: string; price: number; priceId: string; description: string }>> = {
    solo: { id: 'solo-plus', name: 'Solo+', price: 45, priceId: 'price_mock_soloplus_monthly', description: 'Unlocks collaborative tools & Workshop Mode.' },
    business: { id: 'business-adv', name: 'Business Adv', price: 95, priceId: 'price_mock_bizadv_monthly', description: 'Advanced SME orchestration & Workshop features.' },
};

const CheckoutForm: React.FC<{ onSuccessfulPayment: () => void; totalPrice: number }> = ({ onSuccessfulPayment, totalPrice }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        // --- SIMULATION FOR SCAFFOLDING ---
        // This block simulates the payment confirmation, including potential failures,
        // because our mock backend provides a fake client secret.
        console.log("--- SIMULATING STRIPE PAYMENT CONFIRMATION ---");
        console.log("Simulating various outcomes...");
        setTimeout(() => {
            const random = Math.random();
            if (random < 0.75) { // 75% success
                console.log("--- SIMULATION SUCCEEDED ---");
                setErrorMessage(undefined);
                onSuccessfulPayment();
            } else if (random < 0.9) { // 15% card declined
                console.warn("--- SIMULATING PAYMENT FAILURE: Card Declined ---");
                setErrorMessage("Your card was declined. Please check the details and try again.");
            } else { // 10% insufficient funds
                console.warn("--- SIMULATING PAYMENT FAILURE: Insufficient Funds ---");
                setErrorMessage("Your card has insufficient funds. Please try a different card.");
            }
            setIsProcessing(false);
        }, 2000);
        // --- END SIMULATION ---
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isProcessing ? <LoadingIcon className="w-5 h-5 mx-auto"/> : `Pay $${totalPrice.toFixed(2)}`}
            </button>
            {errorMessage && <div className="text-sm text-red-400 text-center">{errorMessage}</div>}
        </form>
    );
};


const SignupModal: React.FC<SignupModalProps> = ({ planInfo, onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [includeLevelUp, setIncludeLevelUp] = useState(false);
  const [view, setView] = useState<'details' | 'payment'>('details');
  const [stripeOptions, setStripeOptions] = useState<any | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const isFormValid = name.trim() && email.trim();
  
  const compatibleLevelUp = levelUpOptions[planInfo.plan];
  
  const { totalPrice, planType, levelUpPackage } = useMemo(() => {
    const isLevelUpSelected = includeLevelUp && compatibleLevelUp;
    const finalPrice = planInfo.price + (isLevelUpSelected ? compatibleLevelUp.price : 0);
    
    let base: BasePlan;
    let levelUp: LevelUpPackage | null = null;
    
    if (planInfo.plan === 'solo' || planInfo.plan === 'business') {
        base = planInfo.plan;
    } else {
        base = planInfo.plan.includes('solo') ? 'solo' : 'business';
    }

    if (isLevelUpSelected && compatibleLevelUp) {
        levelUp = compatibleLevelUp.id as LevelUpPackage;
    }

    return { 
      totalPrice: finalPrice, 
      planType: base, 
      levelUpPackage: levelUp,
    };
  }, [planInfo, includeLevelUp, compatibleLevelUp]);
  
  const planIsTrialable = planType === 'solo' || planType === 'business';

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsInitializingPayment(true);
    setInitError(null);
    const { clientSecret, error } = await backend.createPaymentIntent({
        amount: totalPrice * 100, // Stripe expects amount in cents
        currency: 'usd',
        customerInfo: { name, email },
    });
    setIsInitializingPayment(false);

    if (error) {
        setInitError(error);
        return;
    }

    if (clientSecret) {
        setStripeOptions({
            clientSecret,
            appearance: {
                theme: 'night' as const,
                labels: 'floating' as const,
                variables: {
                    colorPrimary: '#06b6d4',
                    colorBackground: '#1e293b',
                    colorText: '#cbd5e1',
                    colorDanger: '#ef4444',
                    fontFamily: 'Ideal Sans, system-ui, sans-serif',
                    borderRadius: '0.5rem',
                }
            },
        });
        setView('payment');
    } else {
        setInitError("An unexpected error occurred while initializing payment. Please try again.");
    }
  };

  const handleSuccessfulPayment = () => {
    onConfirm(
      { name: name.trim(), email: email.trim(), company: company.trim() || 'N/A' },
      { 
          planType: planType,
          levelUpPackage: levelUpPackage,
          billingCycle: planInfo.billingCycle 
      }
    );
  };

  return (
    <Modal title={view === 'details' ? 'Start Your Subscription' : 'Secure Payment'} onClose={onClose} size="lg">
      <div className="text-slate-300 space-y-4">
        
        {/* Price Breakdown */}
        <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center text-white">
                <span className="capitalize">{planInfo.plan.replace('-', '+')} (Base Plan)</span>
                <span className="font-bold">${planInfo.price.toFixed(2)}</span>
            </div>
            {includeLevelUp && compatibleLevelUp && (
                 <div className="flex justify-between items-center text-cyan-300 animate-fade-in">
                    <span className="capitalize">{compatibleLevelUp.name} (Level Up)</span>
                    <span className="font-bold">+ ${compatibleLevelUp.price.toFixed(2)}</span>
                </div>
            )}
            <div className="border-t border-slate-600 pt-3 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Total</h3>
                <p className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
            </div>
             <p className="text-sm text-slate-400 capitalize text-right">{planInfo.billingCycle} billing</p>
        </div>
        
        {view === 'details' ? (
          <form onSubmit={handleProceedToPayment} className="space-y-4 pt-4">
            {initError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-300 text-sm">
                {initError}
              </div>
            )}
            {planIsTrialable && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center text-cyan-300 text-sm">
                Your <strong>7-day free trial</strong> will begin after signup. You can cancel anytime.
              </div>
            )}

            {compatibleLevelUp && (
                <div className="p-4 border border-slate-600 rounded-lg bg-slate-800/50 hover:border-slate-500 transition-colors">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex-grow pr-4">
                        <h4 className="font-bold text-white flex items-center space-x-2">
                            <PlusIcon className="w-4 h-4 text-cyan-400"/>
                            <span>Add {compatibleLevelUp.name}</span>
                        </h4>
                        <p className="text-sm text-slate-400">{compatibleLevelUp.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-lg text-white">+${compatibleLevelUp.price}/mo</span>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${includeLevelUp ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-700 border-slate-500'}`}>
                                {includeLevelUp && <CheckIcon className="w-4 h-4 text-white"/>}
                            </div>
                            <input type="checkbox" checked={includeLevelUp} onChange={(e) => setIncludeLevelUp(e.target.checked)} className="sr-only"/>
                        </div>
                    </label>
                </div>
            )}
            
            <div className="space-y-4 pt-4 border-t border-slate-700">
                <h4 className="font-bold text-white">Your Information</h4>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">Company (Optional)</label>
                  <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
              <button type="submit" disabled={!isFormValid || isInitializingPayment} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center">
                {isInitializingPayment && <LoadingIcon className="w-5 h-5 mr-2"/>}
                {isInitializingPayment ? 'Initializing...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-4">
            {stripeOptions && stripeOptions.clientSecret ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm onSuccessfulPayment={handleSuccessfulPayment} totalPrice={totalPrice} />
                </Elements>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <LoadingIcon className="w-8 h-8"/>
                </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SignupModal;