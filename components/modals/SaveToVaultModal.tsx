import React, { useState, useEffect } from 'react';
import { ChatMessage, VaultItem } from '../../types';
import { backend } from '../../services/backend';
import { generateId } from '../../constants';
import Modal from './Modal';

interface SaveToVaultModalProps {
  message: ChatMessage;
  onClose: () => void;
  onSave: () => void;
  isBuilderOutput?: boolean;
}

const SaveToVaultModal: React.FC<SaveToVaultModalProps> = ({ message, onClose, onSave, isBuilderOutput }) => {
  const [title, setTitle] = useState('New Vault Item');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    backend.fetchCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0) {
        setCategory(cats[0]);
      }
    });
    // Auto-generate a title from the message content
    const cleanedContent = message.content.replace('<!-- BUILDER_OUTPUT -->\n\n', '');
    const potentialTitle = cleanedContent.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50);
    if(potentialTitle) setTitle(potentialTitle);
  }, [message]);

  const handleSave = async () => {
    if (!title.trim() || !category) return;
    setIsSaving(true);
    const newItem: VaultItem = {
      id: generateId(),
      title: title.trim(),
      content: message.content,
      category: category,
      tags: [], // Tags can be implemented later
      createdAt: new Date().toISOString(),
      builderReady: !!isBuilderOutput,
    };
    await backend.saveVaultItem(newItem);
    setIsSaving(false);
    onSave();
  };

  return (
    <Modal title="Save to Vault" onClose={onClose}>
      <div className="space-y-4 text-slate-300">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm text-slate-400 truncate">{message.content.replace('<!-- BUILDER_OUTPUT -->\n\n', '')}</p>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold disabled:bg-slate-600">
            {isSaving ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveToVaultModal;