import React from 'react';
import { SmeConfig, UserProfile, SubscriptionPlan } from '../../types';
import Modal from './Modal';
import SmeSelector from '../SmeSelector';

interface ChangeSmeModalProps {
  effectivePlan: SubscriptionPlan;
  onClose: () => void;
  onConfirm: (config: SmeConfig) => void;
}

const ChangeSmeModal: React.FC<ChangeSmeModalProps> = ({ effectivePlan, onClose, onConfirm }) => {
  return (
    <Modal title="Switch SME" onClose={onClose}>
      {/* FIX: Pass a no-op function for the required 'onSetHelperContext' prop. */}
      <SmeSelector onStartChat={onConfirm} plan={effectivePlan} onSetHelperContext={() => {}} />
    </Modal>
  );
};

export default ChangeSmeModal;
