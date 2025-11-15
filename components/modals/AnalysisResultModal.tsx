import React, { useState } from 'react';
import Modal from './Modal';
import { backend } from '../../services/backend';
import { generateId } from '../../constants';
import { VaultItem } from '../../types';

interface AnalysisResultModalProps {
  sourceText: string;
  analysisType: 'red' | 'blue' | 'green';
  analysisResult: string;
  onClose: () => void;
}

const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({ sourceText, analysisType, analysisResult, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const colors = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300' },
  };
  const colorScheme = colors[analysisType];
  const analysisTypeName = analysisType.charAt(0).toUpperCase() + analysisType.slice(1);

  const handleSave = async () => {
    setIsSaving(true);
    const newItem: VaultItem = {
      id: generateId(),
      title: `[${analysisTypeName} Analysis] ${sourceText.substring(0, 40)}...`,
      content: analysisResult,
      category: 'SME KT',
      tags: [`analysis-${analysisType}`],
      createdAt: new Date().toISOString(),
      sourceText: sourceText,
      analysisType: analysisType,
    };
    await backend.saveVaultItem(newItem);
    setIsSaving(false);
    alert('Analysis saved to SME KT in Vault!');
    onClose();
  };

  return (
    <Modal title={`${analysisTypeName} Analysis`} onClose={onClose} size="2xl">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-2">Source Text</h3>
          <blockquote className={`p-3 rounded-md text-slate-300 text-sm ${colorScheme.bg} ${colorScheme.border}`}>
            "{sourceText}"
          </blockquote>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-2">AI-Generated Insight</h3>
          <div 
            className="prose prose-sm prose-invert max-w-none p-3 bg-slate-700/50 rounded-md max-h-64 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: window.marked.parse(analysisResult) }}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Close</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold disabled:bg-slate-600">
            {isSaving ? 'Saving...' : 'Save to Vault'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AnalysisResultModal;