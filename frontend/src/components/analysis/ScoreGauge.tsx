import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10b981'; // emerald-500
  let badgeText = 'Strong Match';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (clampedScore >= 85) {
    strokeColor = '#10b981';
    badgeText = 'Exceptional Fit';
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (clampedScore >= 70) {
    strokeColor = '#6366f1'; // indigo-500
    badgeText = 'Strong Match';
    badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  } else if (clampedScore >= 50) {
    strokeColor = '#f59e0b'; // amber-500
    badgeText = 'Moderate Fit';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else {
    strokeColor = '#f43f5e'; // rose-500
    badgeText = 'High Gap';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {Math.round(clampedScore)}
            <span className="text-xl text-slate-400 font-semibold">%</span>
          </span>
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            Fit Score
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};
