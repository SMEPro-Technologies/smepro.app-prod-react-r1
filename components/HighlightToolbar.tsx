import React from 'react';

interface HighlightToolbarProps {
  top: number;
  left: number;
  onAnalyze: (type: 'red' | 'blue' | 'green') => void;
}

const HighlightToolbar: React.FC<HighlightToolbarProps> = ({ top, left, onAnalyze }) => {
  return (
    <div 
      className="fixed z-20 flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-full p-1.5 shadow-lg animate-fade-in"
      style={{ top: top, left: left, transform: 'translate(-50%, -120%)' }}
      onMouseUp={(e) => e.stopPropagation()} // Prevent closing when clicking the toolbar itself
    >
      <button onClick={() => onAnalyze('red')} title="Analyze: Concern/Priority" className="w-6 h-6 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors"></button>
      <button onClick={() => onAnalyze('blue')} title="Analyze: Deeper Insight" className="w-6 h-6 rounded-full bg-blue-500/70 hover:bg-blue-500 transition-colors"></button>
      <button onClick={() => onAnalyze('green')} title="Analyze: Monetization/Growth" className="w-6 h-6 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors"></button>
    </div>
  );
};

export default HighlightToolbar;
