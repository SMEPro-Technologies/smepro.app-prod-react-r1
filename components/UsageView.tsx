import React from 'react';
import { UserProfile, CurrentView } from '../types';
import { getEffectivePlan } from '../services/backend';
import UsageMeter from './UsageMeter';

interface UsageViewProps {
  userProfile: UserProfile;
  onNavigate: (page: CurrentView) => void;
  onClose: () => void;
}

const UsageView: React.FC<UsageViewProps> = ({ userProfile, onNavigate, onClose }) => {
  const { quotas, subscription } = userProfile;
  const effectivePlan = getEffectivePlan(subscription);
  
  const handleManageSubscription = () => {
    onClose();
    onNavigate('plans');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Current Plan</h3>
        <p className="text-slate-400 text-sm">
          You are on the <span className="font-bold text-cyan-400 capitalize">{effectivePlan.replace('-', '+')}</span> plan ({subscription.billingCycle} billing).
        </p>
      </div>

      <div className="space-y-4">
        <UsageMeter 
          title="SMEVault Storage"
          used={Number(quotas.vaultStorage.used.toFixed(2))} 
          limit={quotas.vaultStorage.limit} 
          unit="GB"
        />
        <UsageMeter 
          title="SMEAnalyzer Actions"
          used={quotas.analyzerActions.used}
          limit={quotas.analyzerActions.limit}
          unit="Actions"
        />
        <UsageMeter 
          title="AI Bandwidth"
          used={quotas.aiBandwidth.used}
          limit={quotas.aiBandwidth.limit}
          unit="Units"
        />
      </div>

      <div className="text-center">
        <button 
          onClick={handleManageSubscription}
          className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          Manage Subscription & Scale-Up
        </button>
      </div>
    </div>
  );
};

export default UsageView;