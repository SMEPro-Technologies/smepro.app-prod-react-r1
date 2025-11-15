import React, { useState, useEffect, useCallback } from 'react';
import { ChatSession, FunctionName, functionNames, FocusType, focusTypes, DynamicCapability } from '../types';
import { geminiService } from '../../services/geminiService';
import { PuzzlePieceIcon, LightbulbIcon, LoadingIcon } from '../../components/icons';

interface CapabilitiesPanelProps {
  session: ChatSession;
  onSessionUpdate: (session: ChatSession) => void;
  onExplainCapability: (capability: DynamicCapability) => void;
}

const capabilityOptions: { id: FunctionName; label: string; emoji: string; description: string }[] = [
    { id: 'generateCode', label: 'Code Generation', emoji: '✨', description: 'Writes code from natural language.' },
    { id: 'selfCheck', label: 'Self-Correction', emoji: '✅', description: 'Reviews its own work for accuracy.' },
    { id: 'runTerminal', label: 'Terminal Simulation', emoji: '🧪', description: 'Simulates terminal command outputs.' },
    { id: 'automateBrowser', label: 'Browser Automation', emoji: '🌐', description: 'Describes browser automation steps.' },
    { id: 'aiImaging', label: 'AI Imaging Model', emoji: '🖼️', description: 'Enhance, create, and prep images with presets for social media channels.' },
    { id: 'latestModels', label: 'Latest Models', emoji: '🤖', description: 'Uses the most powerful AI models.' },
    { id: 'apiKeyOptional', label: 'API Keys Optional', emoji: '🎁', description: 'No user API keys are required.' },
];

const CapabilitiesPanel: React.FC<CapabilitiesPanelProps> = ({ session, onSessionUpdate, onExplainCapability }) => {
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingCapabilities, setIsLoadingCapabilities] = useState(false);

    useEffect(() => {
        const getSuggestions = async () => {
            if (session.messages.length > 1) {
                setIsLoadingSuggestions(true);
                // We are not using suggestions for now in this new model.
                // const suggestions = await geminiService.suggestCapabilities(session.messages);
                setIsLoadingSuggestions(false);
            }
        };
        getSuggestions();
    }, [session.messages]);

    const handleToggleStatic = (func: FunctionName) => {
        const updatedSession = { ...session };
        if (!updatedSession.enabledFunctions) {
            updatedSession.enabledFunctions = {};
        }
        updatedSession.enabledFunctions[func] = !updatedSession.enabledFunctions[func];
        onSessionUpdate(updatedSession);
    };
    
    const handleFocusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFocus = e.target.value as FocusType | 'none';
        
        if (newFocus === 'none') {
            onSessionUpdate({ ...session, focus: undefined, dynamicCapabilities: [] });
            return;
        }

        setIsLoadingCapabilities(true);
        onSessionUpdate({ ...session, focus: newFocus, dynamicCapabilities: [] });
        
        const newCapabilities = await geminiService.generateFocusCapabilities(newFocus, session.messages);
        const dynamicCaps: DynamicCapability[] = newCapabilities.map(c => ({...c, enabled: false}));
        
        onSessionUpdate({ ...session, focus: newFocus, dynamicCapabilities: dynamicCaps });
        setIsLoadingCapabilities(false);
    };
    
    const handleToggleDynamic = (capability: DynamicCapability) => {
        if (!capability.enabled) {
            onExplainCapability(capability);
        } else {
            const updatedCaps = (session.dynamicCapabilities || []).map(c => 
                c.id === capability.id ? { ...c, enabled: false } : c
            );
            onSessionUpdate({ ...session, dynamicCapabilities: updatedCaps });
        }
    };

    return (
        <aside className="w-80 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <PuzzlePieceIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                    <span>SME Capabilities</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Configure AI functions for this session.</p>
            </div>
            
             <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <label htmlFor="focus-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Focus</label>
                <select
                    id="focus-select"
                    value={session.focus || 'none'}
                    onChange={handleFocusChange}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                    <option value="none">-- Select a Focus --</option>
                    {focusTypes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>

            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {isLoadingCapabilities ? (
                    <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">
                        <LoadingIcon className="w-6 h-6"/>
                    </div>
                ) : session.focus && session.dynamicCapabilities && session.dynamicCapabilities.length > 0 ? (
                    <>
                        <p className="px-2 pt-1 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Dynamic Capabilities</p>
                        {session.dynamicCapabilities.map(cap => (
                            <label key={cap.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title={cap.description}>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cap.name}</span>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    checked={cap.enabled}
                                    onChange={() => handleToggleDynamic(cap)}
                                />
                            </label>
                        ))}
                    </>
                ) : (
                    <>
                        <p className="px-2 pt-1 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Static Capabilities</p>
                        {capabilityOptions.map(option => (
                            <label key={option.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title={option.description}>
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{option.emoji}</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{option.label}</span>
                                </div>
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                        checked={!!session.enabledFunctions?.[option.id]}
                                        onChange={() => handleToggleStatic(option.id)}
                                    />
                                </div>
                            </label>
                        ))}
                    </>
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-md font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <LightbulbIcon className="w-5 h-5 text-yellow-400 dark:text-yellow-300" />
                    <span>AI Guidance</span>
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 p-3 mt-2 bg-slate-100 dark:bg-slate-800 rounded-md min-h-[60px]">
                   {session.focus ? (
                       <p>Select a dynamic capability above to see a contextual explanation of how it can help you achieve your goal of <strong className="text-cyan-600 dark:text-cyan-300">{session.focus}</strong>.</p>
                   ) : (
                       <p>Select a "Focus" to get AI-generated capabilities tailored to your specific goals for this session.</p>
                   )}
                </div>
            </div>
        </aside>
    );
};

export default CapabilitiesPanel;