import React from 'react';
import { SmeProLogo, ChevronRightIcon, CheckCircleIcon } from './icons';
import { SmeHelperContext } from '../types';

interface HomePageProps {
  onGetStarted: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const ProblemCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
        <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">{title}</h3>
        <div className="space-y-4 text-slate-600 dark:text-slate-300">{children}</div>
    </div>
);


const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onSetHelperContext }) => {
  return (
    <div onMouseEnter={() => onSetHelperContext('APP_HOME')}>
      <div className="animate-fade-in container mx-auto px-6 py-24 text-center">
        <div className="flex justify-center items-center mb-6">
          <SmeProLogo className="w-24 h-24" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">
          Subject Matter Expert AI
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
          Safe. Actionable Intelligence. Empowering anyone with artificial super intelligence — turning ideas, thoughts, and vision into actionable outcomes.
        </p>
        <button
          onClick={onGetStarted}
          className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          Start Your First Session
          <ChevronRightIcon className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">The End of AI Guesswork.</h2>
                <h2 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 mt-2">The Beginning of Collaborative Intelligence.</h2>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Problem Statement:</strong> Generic AI provides meandering answers. SMEPro delivers structured, safe, and actionable outputs.</p>
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mt-16 max-w-7xl mx-auto">
                <ProblemCard title="Beyond Single-Agent AI">
                    <p><strong className="text-slate-900 dark:text-white">Issue:</strong> A single AI can't be an expert in everything. Complex problems require multiple perspectives.</p>
                    <p className="flex items-start"><CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-1 flex-shrink-0"/> <strong className="text-slate-900 dark:text-white">SMEPro Resolves:</strong> Our platform enables true collaborative intelligence. Engage multiple SMEs in one session, or use Workshop Mode to align a team of AI experts on your specific goals.</p>
                </ProblemCard>
                <ProblemCard title="Context-Drift & Lack of Focus">
                     <p><strong className="text-slate-900 dark:text-white">Issue:</strong> AI conversations often lose focus, straying from the original objective and wasting valuable time.</p>
                     <p className="flex items-start"><CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-1 flex-shrink-0"/> <strong className="text-slate-900 dark:text-white">SMEPro Resolves:</strong> Workshop Mode keeps AI teams on-task. SMEs detect off-topic shifts, explain the reasoning, and recommend adjustments to stay aligned with your preset agenda and objectives.</p>
                </ProblemCard>
                <ProblemCard title="From Chat to Action">
                    <p><strong className="text-slate-900 dark:text-white">Issue:</strong> Conversations are just the start. Users need to turn insights into tangible deliverables.</p>
                    <p className="flex items-start"><CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-1 flex-shrink-0"/> <strong className="text-slate-900 dark:text-white">SMEPro Resolves:</strong> Our integrated suite (Vault, Analyzer, Builder, Workbench) forms a complete workflow from idea to outcome, turning collaborative intelligence into actionable results.</p>
                </ProblemCard>
            </div>

            <div className="max-w-4xl mx-auto mt-24 text-slate-600 dark:text-slate-400 text-left border-t border-slate-200 dark:border-slate-800 pt-16">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Our Vision</h3>
              <div className="space-y-6 prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-center">
                <p>Empowering anyone with artificial super intelligence — turning ideas, thoughts, and vision into actionable outcomes.</p>
                <p>SMEPro moves beyond single-agent chat to become a collaborative AI operating system for knowledge work. We provide the first real opportunity for each of us to have our own team of super-intelligent experts, leveling the playing field and allowing raw talent to achieve what was once out of reach.</p>
              </div>
            </div>

            <div className="text-center mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h4 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-6">SMEPro.app - Subject Matter Expert AI. Safe. Actionable Intelligence.</h4>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-500 font-medium">
                  <span>"Your Collaborative AI Workspace."</span>
                  <span>"The End of AI Guesswork."</span>
                  <span>"Move from conversation to creation."</span>
                  <span>"Less Chat. More Action."</span>
              </div>
              <div className="text-center mt-4">
                <a href="#admin" className="text-slate-100 dark:text-slate-900/50 hover:text-slate-200 dark:hover:text-slate-800 transition-colors text-xs">.</a>
              </div>
              <div className="text-center mt-16">
                <p className="text-sm italic text-slate-500 font-serif">
                    SMEPro.app is and will always be in memory of and dedicated to Hubert Henry & Mary (Paw-Paw) Lou Henry (Me-Maw).
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;