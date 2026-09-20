import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  History, 
  Loader2, 
  Plus, 
  Clock
} from 'lucide-react';

import { roadmapAPI } from '../services/api';
import type { 
  RoadmapResponse, 
  RoadmapSummary, 
  RoadmapRequest 
} from '../types';
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline';

export const RoadmapPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Form State
  const [targetRole, setTargetRole] = useState(searchParams.get('role') || 'Senior Cloud & Systems Architect');
  const [skillGapsInput, setSkillGapsInput] = useState(
    searchParams.get('skills') || 'Distributed Caching (Redis), Kafka Event Streams, Terraform IaC, System Design'
  );
  const [currentSkillsInput, setCurrentSkillsInput] = useState('Python, Docker, SQL, REST APIs');
  const [timeframeWeeks, setTimeframeWeeks] = useState(8);

  // Active Roadmap & History
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapResponse | null>(null);
  const [history, setHistory] = useState<RoadmapSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    // If query parameters provided (e.g. from Results page), auto-trigger roadmap generation
    const autoSkills = searchParams.get('skills');
    const autoRole = searchParams.get('role');
    const analysisId = searchParams.get('analysis_id');

    if (autoSkills || analysisId) {
      const gaps = autoSkills ? autoSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
      triggerGenerateRoadmap({
        target_role: autoRole || targetRole,
        skill_gaps: gaps,
        analysis_id: analysisId ? Number(analysisId) : undefined,
        timeframe_weeks: 8,
      });
    }
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await roadmapAPI.getHistory();
      setHistory(data);
      if (data.length > 0 && !activeRoadmap && !searchParams.get('skills')) {
        // Load latest
        const latest = await roadmapAPI.getRoadmap(data[0].id);
        setActiveRoadmap(latest);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingHistory(false);
    }
  };

  const triggerGenerateRoadmap = async (payload: RoadmapRequest) => {
    try {
      setError(null);
      setIsGenerating(true);
      const resp = await roadmapAPI.generate(payload);
      setActiveRoadmap(resp);
      loadHistory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate learning roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const gaps = skillGapsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (gaps.length === 0) {
      setError('Please provide at least one target skill or competency gap.');
      return;
    }

    const current = currentSkillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    await triggerGenerateRoadmap({
      target_role: targetRole.trim() || 'Software Engineer',
      skill_gaps: gaps,
      current_skills: current,
      timeframe_weeks: timeframeWeeks,
    });
  };

  const handleSelectPastRoadmap = async (id: number) => {
    try {
      setError(null);
      setIsGenerating(true);
      const data = await roadmapAPI.getRoadmap(id);
      setActiveRoadmap(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Career Roadmaps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Personalized Skill-Gap Curriculums
          </h1>
          <p className="text-slate-400 text-sm">
            Bridging technical deficiencies through structured, weekly milestone roadmaps and capstone projects.
          </p>
        </div>

        {activeRoadmap && (
          <button
            type="button"
            onClick={() => setActiveRoadmap(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors self-start sm:self-center border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Roadmap</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main View: Form OR Active Roadmap */}
      {!activeRoadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-[#13171a] border border-white/[0.08] p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span>Create Your Custom Learning Curriculum</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Input the role you want and the skills you need to learn. Our AI will synthesize a phased execution plan with portfolio capstones.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Target Job Title / Engineering Track
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Lead Distributed Systems Engineer, Machine Learning Specialist"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1114] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Identified Skill Gaps (Comma-separated)
                  </label>
                  <textarea
                    value={skillGapsInput}
                    onChange={(e) => setSkillGapsInput(e.target.value)}
                    placeholder="e.g. Kubernetes, Apache Kafka, Distributed Caching, System Design, GraphQL"
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1114] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tip: If you recently ran a Job Fit Match, these can be prefilled automatically from your results.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Current Strong Skills (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentSkillsInput}
                      onChange={(e) => setCurrentSkillsInput(e.target.value)}
                      placeholder="e.g. Python, React, SQL"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0d1114] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Target Timeframe
                    </label>
                    <select
                      value={timeframeWeeks}
                      onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0d1114] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    >
                      <option value={4}>4 Weeks (Intensive Bootcamp)</option>
                      <option value={8}>8 Weeks (Standard Balanced Track)</option>
                      <option value={12}>12 Weeks (Comprehensive Mastery)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Curriculum & Projects...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4" />
                        <span>Generate Personalized Roadmap</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Past Roadmaps Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#13171a] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-teal-400" />
                <span>Saved Roadmaps</span>
              </h3>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No saved curriculums yet. Generate one above or from your Job Fit analysis.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {history.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectPastRoadmap(r.id)}
                      className="w-full text-left p-3.5 rounded-xl bg-[#0d1114] border border-white/[0.08] hover:border-teal-500/40 transition-colors group"
                    >
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-teal-400 truncate block mb-1">
                        {r.target_role}
                      </span>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{r.skill_gaps.length} Skill Gaps Targeted</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Roadmap Viewer */
        <div className="space-y-6">
          <RoadmapTimeline roadmap={activeRoadmap.roadmap_data} />
        </div>
      )}
    </div>
  );
};
