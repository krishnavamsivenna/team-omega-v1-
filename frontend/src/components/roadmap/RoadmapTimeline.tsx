import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Target, 
  Code2, 
  BookOpen, 
  ListChecks, 
  ExternalLink, 
  Award,
  Sparkles
} from 'lucide-react';
import type { RoadmapData } from '../../types';

interface RoadmapTimelineProps {
  roadmap: RoadmapData;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmap }) => {
  // Local state to track completed checklist items
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calculate overall checklist progress
  let totalTasks = 0;
  let finishedTasks = 0;
  roadmap.phases.forEach((phase, pIdx) => {
    phase.action_checklist.forEach((_, cIdx) => {
      totalTasks += 1;
      if (completedItems[`${pIdx}-${cIdx}`]) {
        finishedTasks += 1;
      }
    });
  });

  const progressPercent = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950/50 via-[#13171a] to-[#0d1114] border border-teal-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Career Acceleration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Curriculum for {roadmap.target_role}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {roadmap.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d1114]/90 p-4 rounded-2xl border border-white/[0.08] backdrop-blur-md">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block">Estimated Duration</span>
              <span className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-teal-400" />
                {roadmap.estimated_weeks} Weeks
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block">Milestones Completed</span>
              <span className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                <Award className="w-5 h-5" />
                {finishedTasks} / {totalTasks} ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Phased Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 sm:before:left-8 before:w-0.5 before:bg-slate-800">
        {roadmap.phases.map((phase, pIdx) => {
          return (
            <div key={phase.phase_number} className="relative flex items-start gap-4 sm:gap-8 group">
              {/* Phase Node Marker */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-16 sm:h-16 rounded-2xl bg-[#0d1114] border-2 border-teal-500/40 text-teal-400 font-bold text-sm sm:text-lg shadow-xl shrink-0 group-hover:border-teal-400 group-hover:scale-105 transition-all">
                {phase.phase_number}
              </div>

              {/* Phase Content Card */}
              <div className="flex-1 rounded-2xl bg-[#13171a] border border-white/[0.08] p-6 sm:p-7 shadow-xl hover:border-teal-500/30 transition-all space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
                      Phase {phase.phase_number} • {phase.duration}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                      {phase.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d1114] text-slate-300 text-xs font-medium border border-white/[0.08] self-start sm:self-center">
                    <Target className="w-3.5 h-3.5 text-teal-400" />
                    <span>{phase.goal}</span>
                  </div>
                </div>

                {/* Skills Tagged */}
                {phase.skills_covered && phase.skills_covered.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Competencies Covered
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills_covered.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-teal-950/40 text-teal-300 border border-teal-800/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics Grid */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Core Study Topics
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {phase.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d1114] border border-white/[0.06] text-xs text-slate-300"
                      >
                        <span className="text-teal-400 font-bold">•</span>
                        <span className="leading-relaxed">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects to Build */}
                {phase.projects_to_build && phase.projects_to_build.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>Portfolio Projects to Build</span>
                    </span>
                    <div className="space-y-2">
                      {phase.projects_to_build.map((project, projIdx) => (
                        <div
                          key={projIdx}
                          className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200 leading-relaxed font-medium"
                        >
                          🛠️ {project}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {phase.resources && phase.resources.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Curated Learning Resources</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {phase.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url_or_query.startsWith('http') ? res.url_or_query : `https://www.google.com/search?q=${encodeURIComponent(res.url_or_query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-colors group/link"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold block truncate text-slate-200 group-hover/link:text-cyan-300">
                              {res.title}
                            </span>
                            <span className="text-[11px] text-slate-500 uppercase">{res.type}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-cyan-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Checklist */}
                {phase.action_checklist && phase.action_checklist.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                      <ListChecks className="w-4 h-4 text-teal-400" />
                      <span>Execution Milestones</span>
                    </span>
                    <div className="space-y-2">
                      {phase.action_checklist.map((item, cIdx) => {
                        const itemKey = `${pIdx}-${cIdx}`;
                        const isDone = Boolean(completedItems[itemKey]);
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => toggleItem(itemKey)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                              isDone 
                                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 line-through opacity-80' 
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-relaxed">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
