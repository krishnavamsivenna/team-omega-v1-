import React from 'react';
import { Lightbulb, Zap, Target, FileText } from 'lucide-react';
import type { RecommendationItem } from '../../types';

interface RecommendationsListProps {
  recommendations: RecommendationItem[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-xs">
        No specific recommendations generated. Your resume aligns well with standard requirements.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'skill_gap':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'ats_format':
        return <FileText className="w-4 h-4 text-teal-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'High Impact':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Medium Impact':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Actionable Optimization Checklist
        </h4>
        <span className="text-[11px] text-slate-500">Prioritized adjustments to maximize interview callbacks</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/50 dark:bg-[#111518] border border-slate-800 hover:border-teal-500/30 hover:bg-[#13171a] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0 mt-0.5">
                {getIcon(rec.type)}
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white flex items-center gap-2">
                  {rec.title}
                </h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-start gap-2">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getImpactBadge(
                  rec.impact
                )}`}
              >
                {rec.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
