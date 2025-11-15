import React, { useState } from 'react';
import { SuggestedSme, SmeConfig, SmeHelperContext } from '../types';
import { UsersIcon, LoadingIcon, PlusIcon, CheckIcon, BrainCircuitIcon } from './icons';

interface SmePanelProps {
  activeSmes: SmeConfig[];
  suggestedSmes: SuggestedSme[];
  isLoading: boolean;
  onAddSmes: (configs: SmeConfig[]) => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const SmePanel: React.FC<SmePanelProps> = ({ activeSmes, suggestedSmes, isLoading, onAddSmes, onSetHelperContext }) => {
  const [selectedSmes, setSelectedSmes] = useState<Set<SmeConfig>>(new Set());

  const handleToggleSelection = (smeConfig: SmeConfig) => {
    setSelectedSmes(prev => {
      const newSet = new Set(prev);
      const asArray = Array.from(newSet);
      // FIX: Explicitly type the lambda parameter to fix type inference issue with Array.from(Set).
      const existing = asArray.find((s: SmeConfig) => s.segment === smeConfig.segment);
      
      if (existing) {
        newSet.delete(existing);
      } else {
        newSet.add(smeConfig);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    if (selectedSmes.size > 0) {
      onAddSmes(Array.from(selectedSmes));
      setSelectedSmes(new Set());
    }
  };


  return (
    <aside className="w-72 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 flex flex-col" onMouseEnter={() => onSetHelperContext('SME_PANEL')}>
      {/* Active SMEs */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <BrainCircuitIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          <span>Active SMEs</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Currently in your session.</p>
      </div>
      <div className="p-4 space-y-2">
        {activeSmes.map((sme, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white">{sme.segment}</h4>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">{sme.subType}</p>
            </div>
        ))}
      </div>

      {/* Suggested SMEs */}
      <div className="p-4 border-t border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <UsersIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          <span>Suggested SMEs</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Select experts to add value.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-slate-500 dark:text-slate-400">
              <LoadingIcon className="w-6 h-6 mx-auto mb-2" />
              <p>Analyzing context...</p>
            </div>
          </div>
        )}
        {!isLoading && suggestedSmes.length === 0 && (
          <div className="text-center text-slate-500 pt-10 px-2">
            <p>No suggestions at this time. The list will update as you chat.</p>
          </div>
        )}
        {!isLoading && suggestedSmes.length > 0 && (
          <div className="space-y-3">
            {suggestedSmes.map((sme, index) => {
              const isAlreadyAdded = activeSmes.some(s => s.segment === sme.config.segment);
              // FIX: Explicitly type the lambda parameter to fix type inference issue with Array.from(Set).
              const isSelected = Array.from(selectedSmes).some((s: SmeConfig) => s.segment === sme.config.segment);

              return (
                <div 
                  key={index} 
                  onClick={() => !isAlreadyAdded && handleToggleSelection(sme.config)}
                  className={`p-3 rounded-lg border transition-colors ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'bg-cyan-500/10 border-cyan-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{sme.config.segment}</h4>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">{sme.config.subType}</p>
                    </div>
                    <div 
                      className={`flex-shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}
                    >
                      {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">{sme.reason}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleAddSelected}
          disabled={selectedSmes.size === 0 || isLoading}
          className="w-full flex justify-center items-center space-x-2 py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add ({selectedSmes.size}) Selected SMEs</span>
        </button>
      </div>
    </aside>
  );
};

export default SmePanel;