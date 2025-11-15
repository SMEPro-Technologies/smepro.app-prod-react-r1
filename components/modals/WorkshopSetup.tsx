

import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { WorkshopData, SmeConfig, SuggestedSme } from '../../types';
import { geminiService } from '../../services/geminiService';
import { LoadingIcon, SmeProLogo, PlusIcon, CheckIcon } from '../icons';

interface WorkshopSetupProps {
  onClose: () => void;
  onStart: (data: WorkshopData) => void;
  primarySmeConfig: SmeConfig;
}

// Debounce hook to prevent API calls on every keystroke
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const TextArea: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, rows: number}> = ({ label, value, onChange, placeholder, rows }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
    </div>
);

const WorkshopSetup: React.FC<WorkshopSetupProps> = ({ onClose, onStart, primarySmeConfig }) => {
  const [objective, setObjective] = useState('');
  const [agenda, setAgenda] = useState('');
  const [backstory, setBackstory] = useState('');
  const [useCases, setUseCases] = useState('');

  // AI Guidance state
  const [guidance, setGuidance] = useState('Start typing to get AI-powered suggestions.');
  const [suggestedSmes, setSuggestedSmes] = useState<SuggestedSme[]>([]);
  const [isGettingGuidance, setIsGettingGuidance] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<SmeConfig[]>([]);

  const debouncedObjective = useDebounce(objective, 1000);
  const debouncedBackstory = useDebounce(backstory, 1000);

  useEffect(() => {
    const fetchGuidance = async () => {
        if (debouncedObjective.trim().length > 10 || debouncedBackstory.trim().length > 10) {
            setIsGettingGuidance(true);
            const result = await geminiService.getWorkshopGuidanceAndSmes({ objective, backstory }, primarySmeConfig);
            setGuidance(result.guidance);
            setSuggestedSmes(result.smes);
            setIsGettingGuidance(false);
        }
    };
    fetchGuidance();
  }, [debouncedObjective, debouncedBackstory, objective, backstory, primarySmeConfig]);
  
  const handleToggleAttendee = (smeConfig: SmeConfig) => {
    setSelectedAttendees(prev => 
        prev.some(a => a.segment === smeConfig.segment)
        ? prev.filter(a => a.segment !== smeConfig.segment)
        : [...prev, smeConfig]
    );
  };

  const handleStart = () => {
    if (objective.trim()) {
      onStart({ objective, agenda, backstory, useCases, attendees: selectedAttendees });
    }
  };
  
  return (
    <Modal title="Setup Collaborative Workshop" onClose={onClose} size="4xl">
        <div className="flex gap-6 text-slate-300" style={{ height: '65vh' }}>
            {/* Left side: Form */}
            <div className="w-1/2 space-y-4 overflow-y-auto pr-3">
                <p className="text-sm">Define the parameters for your session to align all participating SMEs.</p>
                <TextArea label="Objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What is the primary goal of this workshop?" rows={3} />
                <TextArea label="Agenda / Key Topics (one per line)" value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="e.g.,- Review Q3 marketing data..." rows={4} />
                <TextArea label="Backstory / Context" value={backstory} onChange={(e) => setBackstory(e.target.value)} placeholder="Provide relevant background information." rows={6} />
                <TextArea label="Use Cases / Deliverables" value={useCases} onChange={(e) => setUseCases(e.target.value)} placeholder="What are the expected outputs?" rows={3} />
            </div>

            {/* Right side: AI Guidance */}
            <div className="w-1/2 p-4 bg-slate-700/50 rounded-lg flex flex-col gap-4">
                <div>
                    <h3 className="font-bold text-white flex items-center space-x-2"><SmeProLogo className="w-5 h-5 text-cyan-400" /><span>AI Facilitator</span></h3>
                    <div className="text-sm text-slate-400 p-3 mt-2 bg-slate-800 rounded-md max-h-48 overflow-y-auto">
                        {isGettingGuidance ? <LoadingIcon className="w-5 h-5 mx-auto"/> : <p>{guidance}</p>}
                    </div>
                </div>
                <div className="flex flex-col flex-grow min-h-0">
                    <h4 className="font-semibold text-white mb-2">Recommended SME Attendees</h4>
                    <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                        {suggestedSmes.length > 0 ? suggestedSmes.map((sme, index) => {
                            const isSelected = selectedAttendees.some(a => a.segment === sme.config.segment);
                            return (
                                <div key={index} className="bg-slate-800 p-2 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white text-sm">{sme.config.segment}</p>
                                            <p className="text-xs text-slate-400">{sme.reason}</p>
                                        </div>
                                        <button onClick={() => handleToggleAttendee(sme.config)} className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                            {isSelected ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : !isGettingGuidance && <p className="text-xs text-slate-500 text-center pt-4">No suggestions yet. Keep typing.</p>}
                         {isGettingGuidance && suggestedSmes.length === 0 && <div className="flex justify-center pt-4"><LoadingIcon className="w-5 h-5"/></div>}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleStart} disabled={!objective.trim()} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed">Start Workshop</button>
        </div>
    </Modal>
  );
};

export default WorkshopSetup;