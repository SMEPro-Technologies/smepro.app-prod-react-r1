import React, { useState } from 'react';
import { UserProfile, CurrentView, SmeHelperContext } from '../types';
import { SafetyIcon, CloseIcon, UsageIcon } from './icons';
import UsageView from './UsageView';

interface DashboardProps {
  onClose: () => void;
  userProfile: UserProfile;
  onNavigate: (page: CurrentView) => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const SafetyView: React.FC = () => {
    const [monitoredKeywords, setMonitoredKeywords] = useState('PII, confidential, secret');
    const [logAttempts, setLogAttempts] = useState(true);
    const [warnUser, setWarnUser] = useState(true);

    return (
        <>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Safety Configuration</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Configure how SMEPro monitors for sensitive information.</p>
                </div>
                
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label htmlFor="keywords" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Monitored Keywords</label>
                    <textarea
                    id="keywords"
                    rows={3}
                    value={monitoredKeywords}
                    onChange={(e) => setMonitoredKeywords(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Enter comma-separated keywords"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Prompts containing these keywords will be flagged.</p>
                </div>
                
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                    <label htmlFor="logAttempts" className="font-medium text-slate-900 dark:text-white">Log Flagged Attempts</label>
                    <button onClick={() => setLogAttempts(!logAttempts)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${logAttempts ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <span className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${logAttempts ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-700" />
                    <div className="flex items-center justify-between">
                    <label htmlFor="warnUser" className="font-medium text-slate-900 dark:text-white">Warn User on Flagged Prompt</label>
                    <button onClick={() => setWarnUser(!warnUser)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${warnUser ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <span className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${warnUser ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">A log of flagged prompts would appear here in a real application.</p>
                    <div className="mt-4 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-500">
                    No flagged activity yet.
                    </div>
                </div>
            </div>
             <footer className="flex-shrink-0 p-4 mt-6 text-right">
                <button className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors">
                Save Changes
                </button>
            </footer>
        </>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onClose, userProfile, onNavigate, onSetHelperContext }) => {
  const [activeTab, setActiveTab] = useState<'usage' | 'safety'>('usage');

  const getIconForTab = (tabName: 'usage' | 'safety') => {
      switch (tabName) {
          case 'usage': return <UsageIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />;
          case 'safety': return <SafetyIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />;
      }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 animate-fade-in" onMouseEnter={() => onSetHelperContext('DASHBOARD')}>
      <header className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {getIconForTab(activeTab)}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeTab === 'usage' ? 'Usage & Quotas' : 'AI Safety Dashboard'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-4 px-6">
              <button onClick={() => setActiveTab('usage')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'usage' ? 'border-cyan-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Usage & Quotas</button>
              <button onClick={() => setActiveTab('safety')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'safety' ? 'border-cyan-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>AI Safety</button>
          </nav>
      </div>

      <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'usage' && <div onMouseEnter={() => onSetHelperContext('DASHBOARD_USAGE')}><UsageView userProfile={userProfile} onNavigate={onNavigate} onClose={onClose} /></div>}
          {activeTab === 'safety' && <div onMouseEnter={() => onSetHelperContext('DASHBOARD_SAFETY')}><SafetyView /></div>}
      </div>
    </div>
  );
};

export default Dashboard;