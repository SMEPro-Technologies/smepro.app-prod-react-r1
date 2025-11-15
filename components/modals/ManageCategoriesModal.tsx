
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/backend';
import Modal from './Modal';
import { PlusIcon, DeleteIcon } from '../icons';

interface ManageCategoriesModalProps {
  onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    backend.fetchCategories().then(setCategories);
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      setCategories(updated);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updated = categories.filter(c => c !== categoryToDelete);
    setCategories(updated);
  };
  
  const handleSave = () => {
      backend.saveCategories(categories).then(onClose);
  };

  return (
    <Modal title="Manage Vault Categories" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center bg-slate-700 p-2 rounded-md">
                    <span className="text-white">{cat}</span>
                    <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500">
                        <DeleteIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
        
        <div className="flex space-x-2">
            <input 
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            />
            <button onClick={handleAddCategory} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md">
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold">Save Categories</button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageCategoriesModal;
