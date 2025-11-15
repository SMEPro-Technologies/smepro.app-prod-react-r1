import React from 'react';
import { VaultIcon, AnalyzeIcon, MarkdownIcon, CollaborationIcon, AddSmeIcon, WorkshopModeIcon } from './icons';
import { SmeHelperContext } from '../types';

interface FeaturesPageProps {
  onGetStarted: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div role="group" aria-label={title} className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-colors duration-300 h-full">
    <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 text-cyan-500 dark:text-cyan-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{description}</p>
  </div>
);

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onGetStarted, onSetHelperContext }) => {
  return (
    <div className="animate-fade-in container mx-auto px-6 py-16" onMouseEnter={() => onSetHelperContext('APP_FEATURES')}>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">A Collaborative AI Workspace</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">An integrated suite of tools to turn conversations into actionable intelligence and tangible outcomes.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard icon={<VaultIcon className="w-6 h-6"/>} title="SMEVault" description="Your secure knowledge base for storing, tagging, and retrieving key insights from your SME sessions for future analysis and synthesis." />
        <FeatureCard icon={<AnalyzeIcon className="w-6 h-6"/>} title="SMEAnalyzer" description="Leverage AI for contextual analysis. Synthesize new strategies and find hidden connections between your saved items in the Vault." />
        <FeatureCard icon={<MarkdownIcon className="w-6 h-6"/>} title="SMEBuilder" description="Move from analysis to creation. Use AI-augmented tools to draft plans, generate reports, and produce structured outputs from your synthesized insights." />
        <FeatureCard icon={<CollaborationIcon className="w-6 h-6"/>} title="SMEWorkbench" description="A collaborative workspace to refine, tune, and configure Builder outputs into fully functional deliverables like apps, extensions, and guides." />
        <FeatureCard icon={<AddSmeIcon className="w-6 h-6"/>} title="Collaborative SME Sessions" description="Engage with multiple SMEs in one session. The active SME detects context gaps and recommends adding other experts to the conversation." />
        
        {/* Enhanced Workshop Mode Card */}
        <div role="group" aria-label="Workshop Mode" className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-cyan-500 shadow-lg shadow-cyan-500/10 relative overflow-hidden transition-colors duration-300 h-full">
            <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 text-cyan-500 dark:text-cyan-400">
                    <WorkshopModeIcon className="w-6 h-6"/>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workshop Mode</h3>
                <p className="text-slate-600 dark:text-slate-400">A flagship feature for structured collaboration. Set objectives and agendas, and let a team of aligned SMEs co-create and validate outputs in real-time.</p>
            </div>
            <WorkshopModeIcon className="absolute -top-4 -right-4 w-24 h-24 text-slate-200/50 dark:text-slate-700/50 transform rotate-12" />
        </div>
      </div>
      <div className="text-center mt-16">
         <button
            onClick={onGetStarted}
            className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Get Started Now
          </button>
      </div>
    </div>
  );
};

export default FeaturesPage;