import React, { useState } from 'react';
import type { AnalysisHistoryItem } from '../../types';

interface MatchTrajectoryChartProps {
  history: AnalysisHistoryItem[];
  height?: number;
}

export const MatchTrajectoryChart: React.FC<MatchTrajectoryChartProps> = ({
  history,
  height = 140,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-xs text-slate-500">
        Run multiple match analyses to plot your alignment trajectory.
      </div>
    );
  }

  // Chronological order (oldest to newest, up to last 7)
  const sorted = [...history]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-7);

  const scores = sorted.map((s) => s.overall_score);
  const minScore = Math.max(0, Math.min(...scores) - 15);
  const maxScore = 100;
  const range = maxScore - minScore || 1;

  // Chart coordinate calculation
  const chartHeight = height - 30;

  const points = sorted.map((item, idx) => {
    const x = sorted.length === 1 ? 50 : (idx / (sorted.length - 1)) * 92 + 4;
    const y = chartHeight - ((item.overall_score - minScore) / range) * (chartHeight - 16) - 8;
    return { x, y, item };
  });

  const pathD = points.length === 1
    ? ''
    : points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  const areaD = points.length === 1
    ? ''
    : `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="w-full space-y-2 select-none">
      <div className="relative w-full" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="trajectoryGradient" x1="0%" y1="0%" x2="0%" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Grid lines */}
          <line x1="0" y1={chartHeight * 0.25} x2="100" y2={chartHeight * 0.25} stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="0" y1={chartHeight * 0.5} x2="100" y2={chartHeight * 0.5} stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="0" y1={chartHeight * 0.75} x2="100" y2={chartHeight * 0.75} stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />

          {/* Shaded Area */}
          {areaD && <path d={areaD} fill="url(#trajectoryGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4 : 2.5}
                  fill="#0d1114"
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute -top-7 px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-[#13171a] border border-slate-700 text-slate-100 text-[11px] font-semibold pointer-events-none transform -translate-x-1/2 whitespace-nowrap shadow-xl"
            style={{ left: `${points[hoveredIdx].x}%` }}
          >
            <span className="text-teal-400 font-bold">{Math.round(points[hoveredIdx].item.overall_score)}%</span> - {points[hoveredIdx].item.job_title}
          </div>
        )}
      </div>

      {/* Bottom Labels */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Oldest: {Math.round(sorted[0].overall_score)}%</span>
        <span>
          Latest: <strong className="text-emerald-400">{Math.round(sorted[sorted.length - 1].overall_score)}%</strong>
        </span>
      </div>
    </div>
  );
};
