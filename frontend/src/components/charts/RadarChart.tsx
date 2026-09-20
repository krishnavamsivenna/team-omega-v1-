import React, { useState } from 'react';

export interface RadarDataPoint {
  label: string;
  value: number; // 0 to 100
  benchmark?: number; // optional target/job expectation
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  className?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 280,
  className = '',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<RadarDataPoint | null>(null);

  if (!data || data.length < 3) {
    return null;
  }

  const center = size / 2;
  const radius = center * 0.72;
  const totalSides = data.length;
  const angleSlice = (Math.PI * 2) / totalSides;

  // Concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate coordinates for a value at a given index
  const getCoordinates = (index: number, factor: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x = center + radius * factor * Math.cos(angle);
    const y = center + radius * factor * Math.sin(angle);
    return { x, y };
  };

  // Build candidate polygon points
  const candidatePoints = data
    .map((d, i) => {
      const factor = Math.min(100, Math.max(0, d.value)) / 100;
      const { x, y } = getCoordinates(i, factor);
      return `${x},${y}`;
    })
    .join(' ');

  // Build target benchmark polygon points (if benchmark provided)
  const hasBenchmark = data.some((d) => d.benchmark !== undefined);
  const benchmarkPoints = hasBenchmark
    ? data
        .map((d, i) => {
          const factor = Math.min(100, Math.max(0, d.benchmark || 85)) / 100;
          const { x, y } = getCoordinates(i, factor);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          {/* Candidate gradient */}
          <linearGradient id="candidateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.25" />
          </linearGradient>

          {/* Benchmark gradient */}
          <linearGradient id="benchmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Concentric grid webs */}
        {levels.map((lvl) => {
          const webPoints = Array.from({ length: totalSides })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvl}
              points={webPoints}
              fill="none"
              stroke="#334155"
              strokeWidth={lvl === 1.0 ? '1.5' : '1'}
              strokeDasharray={lvl < 1.0 ? '2 2' : undefined}
              className="opacity-60"
            />
          );
        })}

        {/* Axis spokes */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              className="opacity-50"
            />
          );
        })}

        {/* Benchmark polygon (Target requirements) */}
        {hasBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="url(#benchmarkGradient)"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="transition-all duration-500"
          />
        )}

        {/* Candidate polygon (Actual score) */}
        <polygon
          points={candidatePoints}
          fill="url(#candidateGradient)"
          stroke="#2dd4bf"
          strokeWidth="2.5"
          className="transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]"
        />

        {/* Data points & labels */}
        {data.map((d, i) => {
          const factor = Math.min(100, Math.max(0, d.value)) / 100;
          const { x: px, y: py } = getCoordinates(i, factor);
          const { x: lx, y: ly } = getCoordinates(i, 1.22);

          const isHovered = hoveredPoint?.label === d.label;

          return (
            <g key={i}>
              {/* Vertex circle */}
              <circle
                cx={px}
                cy={py}
                r={isHovered ? 6 : 4.5}
                fill="#0d1114"
                stroke="#2dd4bf"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Axis Label */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] font-semibold transition-colors duration-200 ${
                  isHovered ? 'fill-teal-300 font-bold' : 'fill-slate-400'
                }`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating or bottom tooltip */}
      <div className="h-6 mt-2 flex items-center justify-center text-xs">
        {hoveredPoint ? (
          <span className="px-3 py-1 rounded-full bg-slate-800/90 dark:bg-[#13171a] border border-slate-700 text-slate-100 font-medium animate-fadeIn">
            <strong className="text-teal-400">{hoveredPoint.label}:</strong> {Math.round(hoveredPoint.value)}%
            {hoveredPoint.benchmark && (
              <span className="text-cyan-400 ml-1.5">(Role Target: {hoveredPoint.benchmark}%)</span>
            )}
          </span>
        ) : (
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block shadow-sm shadow-teal-400/50" />
              Candidate Profile
            </span>
            {hasBenchmark && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 inline-block" />
                Target Role Benchmark
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
