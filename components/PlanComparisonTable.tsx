import React from 'react';
import { SubscriptionPlan } from '../types';
import { CheckCircleIcon, CloseIcon } from './icons';

interface PlanComparisonTableProps {
  billingCycle: 'monthly' | 'annual';
  onChoosePlan: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual', price: number, priceId: string) => void;
}

type PlanId = 'solo' | 'business' | 'solo-plus' | 'business-adv' | 'enterprise-oem';

const planDetails = {
    plans: [
        { id: 'solo' as PlanId, name: 'SMEPro Solo', priceMonthly: 25, priceAnnual: 20, isFeatured: false, priceIds: { monthly: 'price_mock_solo_monthly', annual: 'price_mock_solo_annual' } },
        { id: 'business' as PlanId, name: 'SMEPro Business', priceMonthly: 55, priceAnnual: 44, isFeatured: true, priceIds: { monthly: 'price_mock_biz_monthly', annual: 'price_mock_biz_annual' } },
        { id: 'solo-plus' as PlanId, name: 'Solo+ (Addon)', priceMonthly: 45, priceAnnual: 36, isFeatured: false, priceIds: { monthly: 'price_mock_soloplus_monthly', annual: 'price_mock_soloplus_annual' } },
        { id: 'business-adv' as PlanId, name: 'Business Adv (Addon)', priceMonthly: 95, priceAnnual: 76, isFeatured: false, priceIds: { monthly: 'price_mock_bizadv_monthly', annual: 'price_mock_bizadv_annual' } },
        { id: 'enterprise-oem' as PlanId, name: 'Enterprise OEM', priceMonthly: 0, priceAnnual: 0, isFeatured: false, priceIds: null },
    ],
    features: [
        { name: 'AI Tasks/mo', values: { solo: '50', business: '200', 'solo-plus': '200 (Total)', 'business-adv': '700 (Total)', 'enterprise-oem': 'Unlimited' } },
        { name: 'SMEVault Storage', values: { solo: '1 GB', business: '10 GB', 'solo-plus': '6 GB (Total)', 'business-adv': '60 GB (Total)', 'enterprise-oem': 'Tiered TBs' } },
        { name: 'SMEAnalyzer', values: { solo: 'Standard analysis', business: 'Advanced analysis', 'solo-plus': 'Advanced analysis', 'business-adv': 'Multi-document synthesis', 'enterprise-oem': 'Predictive modeling' } },
        { name: 'SMEBuilder', values: { solo: 'Basic content generation', business: 'Expanded creation tools', 'solo-plus': 'Expanded creation tools', 'business-adv': 'Full app/extension generation', 'enterprise-oem': 'OEM licensing' } },
        { name: 'Multi-SME Collaboration', values: { solo: false, business: true, 'solo-plus': true, 'business-adv': true, 'enterprise-oem': true } },
        { name: 'Workshop Mode', values: { solo: false, business: false, 'solo-plus': true, 'business-adv': true, 'enterprise-oem': true } },
    ]
};

const FeatureCell: React.FC<{ value: string | boolean }> = ({ value }) => {
    if (typeof value === 'boolean') {
        return value ? <CheckCircleIcon className="w-6 h-6 text-cyan-400 mx-auto" /> : <CloseIcon className="w-6 h-6 text-slate-500 mx-auto" />;
    }
    return <span className="text-slate-300">{value}</span>;
};


const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({ billingCycle, onChoosePlan }) => {

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-center">
                    <thead>
                        <tr>
                            <th className="p-4 text-left text-lg font-bold text-white w-[20%]">Feature</th>
                            {planDetails.plans.map(plan => (
                                <th key={plan.id} className={`p-4 border-l border-slate-700 w-[16%] ${plan.isFeatured ? 'bg-slate-800 rounded-t-xl' : ''}`}>
                                    <h3 className={`text-2xl font-bold ${plan.isFeatured ? 'text-cyan-400' : 'text-white'}`}>{plan.name}</h3>
                                    {plan.id !== 'enterprise-oem' && (
                                        <div className="mt-2">
                                            <span className="text-4xl font-extrabold text-white">${billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly}</span>
                                            <span className="text-slate-400">/mo</span>
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {planDetails.features.map((feature, index) => (
                            <tr key={feature.name} className="border-t border-slate-700">
                                <td className="p-4 text-left font-semibold text-white">{feature.name}</td>
                                {planDetails.plans.map(plan => (
                                    <td key={plan.id} className={`p-4 border-l border-slate-700 text-sm ${plan.isFeatured ? 'bg-slate-800' : ''}`}>
                                        <FeatureCell value={feature.values[plan.id as PlanId]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="border-t border-slate-700">
                            <td className="p-4"></td>
                            {planDetails.plans.map(plan => {
                                return (
                                    <td key={plan.id} className={`p-4 border-l border-slate-700 ${plan.isFeatured ? 'bg-slate-800 rounded-b-xl' : ''}`}>
                                        {plan.id === 'enterprise-oem' ? (
                                             <a href="mailto:sales@smepro.app" className="w-full block py-3 font-semibold rounded-lg transition-colors bg-slate-700 hover:bg-slate-600 text-white">
                                                Contact Sales
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
                                                    const priceId = plan.priceIds![billingCycle];
                                                    onChoosePlan(plan.id, billingCycle, price, priceId);
                                                }}
                                                className="w-full block py-3 font-semibold rounded-lg transition-colors bg-cyan-500 hover:bg-cyan-600 text-white"
                                            >
                                                Choose Plan
                                            </button>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-12 max-w-4xl mx-auto p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="text-2xl font-bold text-white text-center mb-4">🔎 Key Differentiators</h3>
                <ul className="space-y-3 text-slate-400">
                    <li><strong className="text-cyan-400">Base Plans (Solo & Business) →</strong> Full access to core features, capped by quota and storage.</li>
                    <li><strong className="text-cyan-400">Level Ups (Solo+ & Business Adv) →</strong> Unlock multi-SME collaboration and Workshop Mode, enabling dynamic, collaborative AI sessions on top of your base plan.</li>
                    <li><strong className="text-cyan-400">Enterprise OEM →</strong> Enterprise-grade, fully configurable collaborative AI ecosystem with predictive modeling, OEM licensing, and custom pricing.</li>
                </ul>
            </div>
        </div>
    );
};

export default PlanComparisonTable;