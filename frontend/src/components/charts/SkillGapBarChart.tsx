import React from 'react';
import type { SkillItem } from '../../types';

interface SkillGapBarChartProps {
  matchedSkills: SkillItem[];
  missingSkills: SkillItem[];
}

export const SkillGapBarChart: React.FC<SkillGapBarChartProps> = ({
  matchedSkills,
  missingSkills,
}) => {
  // Aggregate by category
  const categories = ['Languages', 'Frameworks', 'Cloud & DevOps', 'Databases', 'Architecture', 'Other'];
  
  const stats = categories.map((cat) => {
    const matchedCount = matchedSkills.filter((s) => (s.category || 'Other').toLowerCase().includes(cat.toLowerCase().split(' ')[0])).length;
    const missingCount = missingSkills.filter((s) => (s.category || 'Other').toLowerCase().includes(cat.toLowerCase().split(' ')[0])).length;
    const total = matchedCount + missingCount;
    const percent = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
    return {
      category: cat,
      matched: matchedCount,
      missing: missingCount,
      total,
      percent,
    };
  }).filter((item) => item.total > 0);

  if (stats.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        No categorized skills detected.
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {stats.map((s) => (
        <div key={s.category} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">{s.category}</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-medium">{s.matched} matched</span>
              <span className="text-rose-400 font-medium">{s.missing} gaps</span>
              <span className="text-slate-400 font-bold">{s.percent}% coverage</span>
            </div>
          </div>

          {/* Stacked Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(s.matched / s.total) * 100}%` }}
              title={`${s.matched} matched skills`}
            />
            <div
              className="h-full bg-rose-500/80 transition-all duration-500"
              style={{ width: `${(s.missing / s.total) * 100}%` }}
              title={`${s.missing} missing skill gaps`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
