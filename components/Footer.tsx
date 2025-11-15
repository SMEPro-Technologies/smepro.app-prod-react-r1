import React from 'react';
import { CurrentView } from '../types';
import { SmeProLogo } from './icons';

interface FooterProps {
  onNavigate: (page: CurrentView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <SmeProLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">SMEPro</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              SMEPro is a Collaborative AI Operating System designed to turn your ideas into actionable outcomes through a suite of specialized tools and expert AI agents.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => onNavigate('features')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Features</button></li>
                  <li><button onClick={() => onNavigate('how-it-works')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">How It Works</button></li>
                  <li><button onClick={() => onNavigate('plans')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Plans</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                   <li><button onClick={() => onNavigate('contact')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Contact Us</button></li>
                   <li><a href="mailto:admin@smepro.app" className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">admin@smepro.app</a></li>
                   <li><a href="mailto:sales@smepro.app" className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">sales@smepro.app</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => onNavigate('privacy-policy')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Privacy Policy</button></li>
                  <li><button onClick={() => onNavigate('terms-of-service')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Terms of Service</button></li>
                  <li><button onClick={() => onNavigate('acceptable-use')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400">Acceptable Use & SAFE AI</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-4">
             <p className="font-semibold text-slate-700 dark:text-slate-300">Disclaimer & Data Privacy Commitment:</p>
             <p>
                SMEPro Technologies is a tool to augment your workflow. The use cases, objectives, and results derived are driven by your individual thoughts, requests, ideas, and goals. Your data, including session conversations and Vault items, is in no way aggregated or used for ML models, and under no circumstances is it used to train models for other users. Your account and your storage are secure and private, with authenticated access only for you.
             </p>
          </div>
           <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 text-center">&copy; {new Date().getFullYear()} SMEPro Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;