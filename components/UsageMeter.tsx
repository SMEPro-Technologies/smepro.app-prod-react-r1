import React from 'react';

interface UsageMeterProps {
  title: string;
  used: number;
  limit: number;
  unit: string;
}

const UsageMeter: React.FC<UsageMeterProps> = ({ title, used, limit, unit }) => {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isOverLimit = percentage > 100;

  const barColor = isOverLimit
    ? 'bg-red-500'
    : percentage > 80
    ? 'bg-yellow-500'
    : 'bg-cyan-500';

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex justify-between items-baseline mb-2">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-slate-400">
          <span className="font-bold text-white">{used.toLocaleString()}</span> / {limit.toLocaleString()} {unit}
        </p>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default UsageMeter;