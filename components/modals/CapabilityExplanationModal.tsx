import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DynamicCapability, ChatSession } from '../../types';
import { geminiService } from '../../services/geminiService';
import { LoadingIcon } from '../icons';

interface CapabilityExplanationModalProps {
  capability: DynamicCapability;
  session: ChatSession;
  onClose: () => void;
  onConfirm: () => void;
}

const CapabilityExplanationModal: React.FC<CapabilityExplanationModalProps> = ({ capability, session, onClose, onConfirm }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      const result = await geminiService.explainDynamicCapability(capability, session.focus, session.messages);
      setExplanation(result);
      setIsLoading(false);
    };
    fetchExplanation();
  }, [capability, session]);

  return (
    <Modal title={`Enable Capability: ${capability.name}`} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-1">Capability</h3>
          <p className="text-white font-semibold">{capability.name}</p>
          <p className="text-sm text-slate-400">{capability.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-2">Contextual Explanation</h3>
          <div className="p-4 bg-slate-700/50 rounded-md min-h-[100px] text-slate-300">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingIcon className="w-6 h-6" />
              </div>
            ) : (
              <p>{explanation}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold disabled:bg-slate-600">
            {isLoading ? 'Loading...' : 'Enable Capability'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CapabilityExplanationModal;