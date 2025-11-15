

import React, { useState, useRef, useEffect } from 'react';
import { ResponseMode } from '../types';
import { WandIcon } from './icons';

interface ResponseModeSelectorProps {
    selectedMode: ResponseMode;
    onModeChange: (mode: ResponseMode) => void;
}

const responseModes: { id: ResponseMode; label: string; description: string }[] = [
    { id: 'default', label: 'Default', description: 'A balanced and detailed response.' },
    { id: 'generate-code', label: 'Generate Code', description: 'Generates a code snippet based on your prompt.' },
    { id: 'quick-insight', label: 'Quick Insight', description: 'A brief, to-the-point summary.' },
    { id: 'solution', label: 'Solution to Problem', description: 'A structured, step-by-step solution.' },
    { id: 'cited-facts', label: 'Cited Facts', description: 'Provides information with sources if available.' },
    { id: 'legal', label: 'Legal Response', description: 'Frames the response from a legal perspective.' },
    { id: 'overview', label: 'Overview', description: 'A high-level summary of the topic.' },
    { id: 'synopsis', label: 'Synopsis', description: 'A very concise summary of key points.' },
];

const ResponseModeSelector: React.FC<ResponseModeSelectorProps> = ({ selectedMode, onModeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (mode: ResponseMode) => {
        onModeChange(mode);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Change Response Style"
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
            >
                <WandIcon className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-20 animate-fade-in">
                    <div className="p-3 border-b border-slate-700">
                        <h4 className="font-bold text-white">Response Style</h4>
                        <p className="text-xs text-slate-400">Control how the SME responds.</p>
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto">
                        {responseModes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => handleSelect(mode.id)}
                                className={`w-full text-left p-2 rounded-md hover:bg-slate-800 ${selectedMode === mode.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300'}`}
                            >
                                <p className="font-semibold">{mode.label}</p>
                                <p className="text-xs text-slate-400">{mode.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResponseModeSelector;