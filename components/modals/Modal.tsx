import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: 'md' | 'lg' | '2xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, size = 'md' }) => {
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-cyan-500/10 w-full ${sizeClasses[size]} m-4 animate-slide-in-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">&times;</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;