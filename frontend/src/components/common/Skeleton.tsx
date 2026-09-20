import React from 'react';

export const SkeletonText: React.FC<{ className?: string; lines?: number }> = ({
  className = 'w-full h-4',
  lines = 1,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-lg bg-slate-800/80 ${className} ${
            i === lines - 1 && lines > 1 ? 'w-3/4' : ''
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = 'p-6' }) => {
  return (
    <div className={`animate-pulse rounded-2xl bg-slate-900 border border-slate-800 ${className} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="w-1/3 h-5 rounded bg-slate-800" />
        <div className="w-12 h-6 rounded-xl bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3.5 rounded bg-slate-800/70" />
        <div className="w-4/5 h-3.5 rounded bg-slate-800/70" />
      </div>
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="w-20 h-4 rounded bg-slate-800" />
        <div className="w-16 h-4 rounded bg-slate-800" />
      </div>
    </div>
  );
};

export const SkeletonGauge: React.FC = () => {
  return (
    <div className="animate-pulse flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-44 h-44 rounded-full border-8 border-slate-800 flex items-center justify-center">
        <div className="w-20 h-10 rounded bg-slate-800/80" />
      </div>
      <div className="w-32 h-4 rounded bg-slate-800" />
      <div className="w-48 h-3 rounded bg-slate-800/60" />
    </div>
  );
};
