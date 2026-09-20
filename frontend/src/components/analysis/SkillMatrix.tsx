import React, { useState } from 'react';
import { CheckCircle2, XCircle, PlusCircle, Sparkles, Filter } from 'lucide-react';
import type { SkillItem } from '../../types';
import { Badge } from '../common/Badge';

interface SkillMatrixProps {
  matchedSkills: SkillItem[];
  missingSkills: SkillItem[];
  bonusSkills: SkillItem[];
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  matchedSkills,
  missingSkills,
  bonusSkills,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'missing' | 'bonus'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Collect all unique categories
  const allSkills = [...matchedSkills, ...missingSkills, ...bonusSkills];
  const categories = ['all', ...Array.from(new Set(allSkills.map((s) => s.category)))];

  const filterList = (list: SkillItem[]) => {
    if (selectedCategory === 'all') return list;
    return list.filter((item) => item.category === selectedCategory);
  };

  const filteredMatched = filterList(matchedSkills);
  const filteredMissing = filterList(missingSkills);
  const filteredBonus = filterList(bonusSkills);

  return (
    <div className="space-y-5">
      {/* Tab Navigation & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Skills ({allSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matched')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'matched'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Matched ({matchedSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('missing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'missing'
                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Missing Gaps ({missingSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bonus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'bonus'
                ? 'bg-teal-950/40 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            Bonus Strengths ({bonusSkills.length})
          </button>
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-[#0d1114] border border-white/[0.08] rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-teal-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Matrix Display */}
      <div className="space-y-6">
        {/* Missing Skills (Prioritized to help the user act) */}
        {(activeTab === 'all' || activeTab === 'missing') && filteredMissing.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Missing Job Requirements ({filteredMissing.length})
              </h4>
              <span className="text-[11px] text-slate-400">Add these to resume or prep interview answers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredMissing.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs shadow-sm hover:border-rose-500/50 transition-colors"
                >
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({skill.category})</span>
                  {skill.importance === 'high' && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300">
                      Must Have
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matched Skills */}
        {(activeTab === 'all' || activeTab === 'matched') && filteredMatched.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Matched Skills ({filteredMatched.length})
              </h4>
              <span className="text-[11px] text-slate-400">Successfully validated against job description</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredMatched.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs shadow-sm hover:border-emerald-500/50 transition-colors"
                >
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({skill.category})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonus Resume Skills */}
        {(activeTab === 'all' || activeTab === 'bonus') && filteredBonus.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Additional Strengths ({filteredBonus.length})
              </h4>
              <span className="text-[11px] text-slate-400">Skills on your resume beyond the target JD</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredBonus.map((skill, idx) => (
                <Badge key={idx} variant="teal" size="md">
                  {skill.name} <span className="text-[10px] text-slate-400">({skill.category})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filteredMatched.length === 0 && filteredMissing.length === 0 && filteredBonus.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No skills found in the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
