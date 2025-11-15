import React from 'react';
// FIX: Imported VideoCameraIcon to resolve usage error.
import { CheckCircleIcon, BrainCircuitIcon, SMEBuilderIcon, StepByStepIcon, SmeHelperIcon, CollaborationIcon, CodeIcon, ToolchainIcon, ShieldCheckIcon, VaultIcon, AnalyzeIcon, LightbulbIcon, UsersIcon, TimelineIcon, VideoCameraIcon } from './icons';
import { SmeHelperContext } from '../types';

interface HowItWorksPageProps {
  onGetStarted: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const Step: React.FC<{ number: number; title: string; description: string; }> = ({ number, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-cyan-500 dark:text-cyan-400 font-bold text-xl rounded-full border-2 border-slate-200 dark:border-slate-600">
            {number}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-16">
    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">{title}</h2>
    {children}
  </div>
);

const PillarCard: React.FC<{ icon: React.ReactNode; label: string; description: string }> = ({ icon, label, description }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
        <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg text-cyan-500 dark:text-cyan-400">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{label}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </div>
);

const corePhilosophy = [
    { label: "Empowerment, not replacement", description: "Augment human judgment with AI execution to amplify clarity, speed, and confidence." },
    { label: "Closed-loop outcomes", description: "Every request drives toward a functional, verifiable resolve—code shipped, workflow deployed, plan executed." },
    { label: "Knowledge as a living system", description: "Current and legacy knowledge unify into context-aware intelligence that learns, adapts, and persists." },
    { label: "Access for all", description: "Expertise is no longer gated by who you know, where you came from, or budget constraints." }
];

const pillars = [
    { icon: <SMEBuilderIcon className="w-6 h-6"/>, label: "Insight-to-action bridge", description: "Convert questions into executable steps, artifacts, and deployments that resolve the original intent." },
    { icon: <StepByStepIcon className="w-6 h-6"/>, label: "Step-by-step mode", description: "Conversational orchestration of CI/CD, environments, secrets, and rollbacks with traceable logs and approvals." },
    { icon: <SmeHelperIcon className="w-6 h-6"/>, label: "SMEHelper mode", description: "Domain-tuned assistants blend industry knowledge, best practices, and lived experience to guide decisions." },
    { icon: <BrainCircuitIcon className="w-6 h-6"/>, label: "AI assimilation", description: "Unified memory across Vault, Analyzer, Builder, and Workbench for reproducible, reviewer-proof operations." }
];

const advancedCode = [
    { icon: <CodeIcon className="w-6 h-6"/>, label: "Branching + PR automation", description: "Generate modules as branches with diffs, tests, and review prompts; auto-link issues and documentation." },
    { icon: <ToolchainIcon className="w-6 h-6"/>, label: "Multi-language scaffolding", description: "Produce backend/frontend modules with contracts, schema validation, and environment-aware configuration." },
    { icon: <VideoCameraIcon className="w-6 h-6"/>, label: "Instant preview", description: "Spin up isolated preview environments for UI, APIs, and workflows; share via session links for live feedback." },
    { icon: <ShieldCheckIcon className="w-6 h-6"/>, label: "Gatekeeper checks", description: "Enforce linting, SAST/DAST, dependency health, and secrets policies before merging or deployment." }
];

const workflowLoop = [
    { label: "Problem framing", description: "Translate a vision into constraints, inputs, and acceptance tests." },
    { label: "Builder blueprints", description: "Produce a concise execution plan with milestones, KPIs, and risk mitigations." },
    { label: "Code + configs + docs", description: "Emit modules, infra manifests, runbooks, and tests aligned to the plan." },
    { label: "Workbench execution", description: "Run CI/CD, stand up virtual apps, validate against acceptance tests, log outcomes." },
    { label: "Analyzer feedback", description: "Compare KPIs to targets, capture learnings, update knowledge graph, propose next steps." },
    { label: "Functional resolve", description: "Deliver the verified result back to the original intent; archive artifacts in Vault." }
];

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onGetStarted, onSetHelperContext }) => {
  return (
    <div className="animate-fade-in" onMouseEnter={() => onSetHelperContext('APP_HOW_IT_WORKS')}>
        <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Simple Steps to Expert Guidance</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">Get from idea to insight in minutes. Here’s how SMEPro Lite streamlines your workflow.</p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-8">
                <Step number={1} title="Select Your Expert" description="Choose an industry, sub-type, and segment to configure a narrowly-trained AI model for your specific needs." />
                <Step number={2} title="Start the Conversation" description="Engage in a contextual chat session. The AI understands your domain and provides relevant, actionable advice." />
                <Step number={3} title="Save to Your Vault" description="Capture key insights, code snippets, or entire plans in your personal knowledge base with a single click." />
                <Step number={4} title="Analyze & Synthesize" description="Use the AI-powered Analysis Workbench to connect ideas from your Vault and generate novel strategies." />
            </div>

            <div className="text-center mt-16">
                <button
                    onClick={onGetStarted}
                    className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
                    >
                    Begin Your First Session
                </button>
            </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/70 mt-16">
            <div className="container mx-auto px-6 py-16">
                 <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">The SMEPro Vision</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto">
                        SMEPro is designed to turn insights into intelligence, and intelligence into action—closing the loop from idea to implemented outcome. It’s code generation, DevOps, and expert guidance fused into a single, interactive system that makes progress inevitable.
                    </p>
                </div>

                <Section title="Core Philosophy">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {corePhilosophy.map(item => (
                             <div key={item.label} className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 h-full text-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.label}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                
                <Section title="Pillars of the Experience">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pillars.map(pillar => <PillarCard key={pillar.label} {...pillar} />)}
                    </div>
                </Section>

                <Section title="Advanced Code Generation">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {advancedCode.map(item => <PillarCard key={item.label} {...item} />)}
                    </div>
                </Section>

                 <Section title="The Workflow Loop: From Question to Outcome">
                    <div className="max-w-3xl mx-auto relative pl-12">
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
                        {workflowLoop.map((item, index) => (
                             <div key={index} className="relative mb-10">
                                <div className="absolute -left-[2.2rem] top-0.5 w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700">
                                    <TimelineIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400"/>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.label}</h4>
                                <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                 </Section>
                 <div className="text-center mt-16">
                    <button
                        onClick={onGetStarted}
                        className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
                        >
                        Start Building Now
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HowItWorksPage;
