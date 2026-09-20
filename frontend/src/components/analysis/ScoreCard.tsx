import React from 'react';
import { Layers, FileCheck, Search, Award } from 'lucide-react';
import type { ScoreBreakdown } from '../../types';

interface ScoreCardProps {
  breakdown: ScoreBreakdown;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ breakdown }) => {
  const metrics = [
    {
      title: 'Technical Skills Match',
      weight: '45% Weight',
      score: breakdown.hard_skills,
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      color: 'bg-indigo-500',
      description: 'Overlap between your skills and required role competencies',
    },
    {
      title: 'Keyword & Semantic Relevance',
      weight: '30% Weight',
      score: breakdown.keyword_relevance,
      icon: <Search className="w-4 h-4 text-sky-400" />,
      color: 'bg-sky-500',
      description: 'TF-IDF vector cosine similarity across domain terminology',
    },
    {
      title: 'ATS Structural Readability',
      weight: '15% Weight',
      score: breakdown.ats_readability,
      icon: <FileCheck className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-500',
      description: 'Header clarity, contact completeness, action verbs & metrics',
    },
    {
      title: 'Experience Alignment',
      weight: '10% Weight',
      score: breakdown.experience_alignment,
      icon: <Award className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-500',
      description: 'Years of demonstrated experience vs seniority requirements',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((item, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-200">{item.title}</span>
              </div>
              <span className="text-sm font-extrabold text-white">
                {Math.round(item.score)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{item.description}</p>
          </div>

          <div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>{item.weight}</span>
              <span>{item.score >= 75 ? 'Strong' : item.score >= 50 ? 'Average' : 'Improve'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
