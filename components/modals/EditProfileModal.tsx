import React, { useState } from 'react';
import { UserProfile, CurrentView } from '../../types';
import { getEffectivePlan } from '../../services/backend';
import Modal from './Modal';

interface EditProfileModalProps {
  currentUserProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onClose: () => void;
  onSyncComplete: () => void;
  onNavigate: (page: CurrentView) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUserProfile, onSave, onClose, onSyncComplete, onNavigate }) => {
  const [profile, setProfile] = useState(currentUserProfile);
  
  const handleSave = () => {
    onSave(profile);
  };
  
  const handleManageSubscription = () => {
    onClose();
    onNavigate('plans');
  };

  const effectivePlan = getEffectivePlan(profile.subscription);

  return (
    <Modal title="Edit Profile & Settings" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">Company</label>
          <input
            type="text"
            id="company"
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        
        <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <p className="text-slate-300">Your current plan: <span className="font-bold text-cyan-400 capitalize">{effectivePlan.replace('-', '+')} ({profile.subscription.billingCycle})</span></p>
            <button onClick={handleManageSubscription} className="text-sm text-cyan-400 hover:underline mt-1">
                Manage Subscription
            </button>
        </div>

        <div>
            <h3 className="text-md font-bold text-white mb-2">Universal API Connectors</h3>
            <div className="space-y-3 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-400">Connect your keys to sync and normalize conversation histories from other AI services into your Vault.</p>
                {/* In a real app, this would be a dynamic list */}
                 <input type="text" placeholder="OpenAI API Key" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                 <input type="text" placeholder="Grok API Key" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                <button onClick={onSyncComplete} className="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold">Sync Connectors</button>
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold">Save Changes</button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;