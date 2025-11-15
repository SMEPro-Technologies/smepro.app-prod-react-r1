import React, { useState } from 'react';
import { SmeHelperContext, SubscriptionPlan } from '../types';
import PlanComparisonTable from './PlanComparisonTable';
import PaymentModal from './modals/PaymentModal';

interface PlansPageProps {
  onSetHelperContext: (context: SmeHelperContext) => void;
  onChoosePlan: (
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'annual',
    price: number,
    priceId: string
  ) => void;
}

const PlansPage: React.FC<PlansPageProps> = ({ onSetHelperContext, onChoosePlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedPriceId, setSelectedPriceId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleChoosePlan = (
    plan: SubscriptionPlan,
    cycle: 'monthly' | 'annual',
    price: number,
    priceId: string
  ) => {
    setSelectedPlan(plan);
    setSelectedPrice(price);
    setSelectedPriceId(priceId);
    setShowPaymentModal(true);

    // Call parent handler (analytics, context, etc.)
    onChoosePlan(plan, cycle, price, priceId);
  };

  return (
    <div
      className="animate-fade-in container mx-auto px-4 sm:px-6 py-16"
      onMouseEnter={() => onSetHelperContext('APP_PLANS')}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
          Find the Perfect Plan
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto">
          Start with a core plan and add enhanced capabilities as you grow. All plans come with a 7-day free trial.
        </p>
      </div>

      <div className="flex justify-center items-center mb-10 space-x-4">
        <span
          className={`font-medium ${
            billingCycle === 'monthly'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() =>
            setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')
          }
          className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-200 dark:bg-slate-700"
        >
          <span
            className={`inline-block w-4 h-4 transform transition-transform bg-white dark:bg-slate-300 rounded-full ${
              billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className={`font-medium ${
            billingCycle === 'annual'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Annual
        </span>
        <span className="text-sm bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 font-bold px-2 py-1 rounded-md hidden sm:inline-block">
          Save 20%
        </span>
      </div>

      <PlanComparisonTable
        billingCycle={billingCycle}
        onChoosePlan={handleChoosePlan}
      />

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          includeAddon={selectedPlan.name === 'Level-Up'}
        />
      )}
    </div>
  );
};

export default PlansPage;
