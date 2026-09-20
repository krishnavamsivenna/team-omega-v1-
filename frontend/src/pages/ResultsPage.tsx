import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Calendar,
  Building2,
  Cpu,
  Layers,
  Search,
  Lightbulb,
  FileText,
  PlusCircle,
  Bot,
  Compass,
  FileEdit,
  Sparkles,
  Target,
  Briefcase,
  Quote,
  AlertCircle,
  Bookmark,
  Check,
  Activity,
} from 'lucide-react';

import { analysisAPI, jobsAPI } from '../services/api';
import type { AnalysisResponse } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { ScoreGauge } from '../components/analysis/ScoreGauge';
import { ScoreCard } from '../components/analysis/ScoreCard';
import { SkillMatrix } from '../components/analysis/SkillMatrix';
import { KeywordAnalysis } from '../components/analysis/KeywordAnalysis';
import { RecommendationsList } from '../components/analysis/RecommendationsList';
import { RadarChart, type RadarDataPoint } from '../components/charts/RadarChart';
import { SkillGapBarChart } from '../components/charts/SkillGapBarChart';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isSavedToBoard, setIsSavedToBoard] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'keywords' | 'recommendations' | 'improvements' | 'guidance' | 'jobs'>('skills');

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await analysisAPI.getReport(Number(id));
        setAnalysis(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch analysis report';
        showToast(msg, 'error');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate, showToast]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToBoard = async () => {
    if (!analysis || isSavedToBoard) return;
    setIsSavingJob(true);
    try {
      await jobsAPI.saveJob({
        title: analysis.job_title,
        company: analysis.company || 'Target Organization',
        match_score: analysis.overall_score,
        status: 'saved',
        location: 'Remote / Hybrid',
        workplace_type: 'Remote',
        job_description: analysis.job_title,
      });
      setIsSavedToBoard(true);
      showToast('Opportunity saved to your Jobs Board pipeline!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save job to board';
      showToast(msg, 'error');
    } finally {
      setIsSavingJob(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Spinner size="xl" label="Synthesizing match report and skill gap matrix..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">The requested analysis result could not be located.</p>
        <Link to="/dashboard">
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(analysis.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const missingSkillsList = analysis.missing_skills.map((m) => m.name).join(', ');

  // Multi-axis radar data comparing candidate to role expectations
  const radarData: RadarDataPoint[] = [
    {
      label: 'Core Skills',
      value: analysis.scores_breakdown.hard_skills,
      benchmark: 85,
    },
    {
      label: 'Keywords',
      value: analysis.scores_breakdown.keyword_relevance,
      benchmark: 80,
    },
    {
      label: 'Experience',
      value: analysis.scores_breakdown.experience_alignment,
      benchmark: 90,
    },
    {
      label: 'ATS Structure',
      value: analysis.scores_breakdown.ats_readability,
      benchmark: 85,
    },
    {
      label: 'Overall Fit',
      value: analysis.overall_score,
      benchmark: 85,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:py-0 print:px-0">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToBoard}
            disabled={isSavedToBoard || isSavingJob}
            icon={isSavedToBoard ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
          >
            {isSavedToBoard ? 'Saved to Board' : isSavingJob ? 'Saving...' : 'Save to Board'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Export / Print
          </Button>

          <Link to="/analyze">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
              Compare Another Role
            </Button>
          </Link>
        </div>
      </div>

      {/* Report Header Card */}
      <Card glow className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Match Report
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analysis.job_title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                {analysis.company || 'Target Organization'}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Resume #{analysis.resume_id}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                <Cpu className="w-3 h-3 text-teal-500 dark:text-teal-400" />
                {analysis.provider_name}
              </span>
            </div>
          </div>

          {/* 1-Click Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Link to="/interview">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/20"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Mock Interview</span>
              </button>
            </Link>

            <Link
              to={`/roadmap?role=${encodeURIComponent(analysis.job_title)}&skills=${encodeURIComponent(missingSkillsList)}&analysis_id=${analysis.id}`}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#181f24] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/[0.08]"
              >
                <Compass className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                <span>Generate Roadmap</span>
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Core Score & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Radial Gauge Card */}
        <Card className="p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={analysis.overall_score} size={180} />
          <div className="text-center mt-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Overall Compatibility Score
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Weighted calculation across technical competencies, domain keywords, and ATS structure.
            </p>
          </div>
        </Card>

        {/* Middle: Radar Chart */}
        <Card className="p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              Role Alignment Radar
            </h4>
            <span className="text-[10px] text-slate-400">vs Target Benchmark</span>
          </div>

          <div className="py-1">
            <RadarChart data={radarData} size={220} />
          </div>

          <div className="text-[11px] text-slate-500 text-center w-full pt-2 border-t border-slate-100 dark:border-slate-800">
            Comparing candidate profile against role requirements
          </div>
        </Card>

        {/* Right: Skill Gap Distribution */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Skill Domain Distribution
            </h4>
            <SkillGapBarChart
              matchedSkills={analysis.matched_skills}
              missingSkills={analysis.missing_skills}
            />
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-emerald-500 font-medium">{analysis.matched_skills.length} Matched</span>
            <span className="text-rose-500 font-medium">{analysis.missing_skills.length} Gaps to Bridge</span>
          </div>
        </Card>
      </div>

      {/* Sub-score Breakdown Cards */}
      <ScoreCard breakdown={analysis.scores_breakdown} />

      {/* Interactive Tabs for In-Depth Drilldowns */}
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Skill Gap Matrix ({analysis.matched_skills.length + analysis.missing_skills.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('improvements')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'improvements'
                ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileEdit className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Resume Improvement Guide ({analysis.resume_improvements?.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guidance')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guidance'
                ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-500 dark:text-teal-400" />
            Application Strategy
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'keywords'
                ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            ATS Keyword Alignment
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            Actionable Optimization Checklist ({analysis.recommendations.length})
          </button>

          {analysis.job_recommendations && analysis.job_recommendations.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Alternative Roles
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <Card className="p-6">
          {activeTab === 'skills' && (
            <SkillMatrix
              matchedSkills={analysis.matched_skills}
              missingSkills={analysis.missing_skills}
              bonusSkills={analysis.bonus_skills}
            />
          )}

          {activeTab === 'improvements' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <span>Resume Bullet Point Critiques & Suggested Rewrites</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Actionable suggestions to transform generic descriptions into high-impact, measurable achievements using the XYZ formula.
                </p>
              </div>

              {analysis.resume_improvements && analysis.resume_improvements.length > 0 ? (
                <div className="space-y-4">
                  {analysis.resume_improvements.map((imp, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-slate-300 dark:border-slate-700">
                          {imp.section}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-rose-500 dark:text-rose-400">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Identified Issue:</strong> {imp.issue}</span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-200">Coach's Advice:</strong> {imp.suggestion}
                      </div>

                      {imp.example_rewrite && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                            ✨ Suggested Exemplar Rewrite:
                          </span>
                          <span className="italic text-emerald-800 dark:text-emerald-200">
                            "{imp.example_rewrite}"
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Your resume has strong structural phrasing for this role.
                </div>
              )}
            </div>
          )}

          {activeTab === 'guidance' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                  <span>Personalized Application & Pitch Strategy</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tailored framing for your cover letter, recruiter screening calls, and interview defense.
                </p>
              </div>

              {analysis.application_guidance && (
                <div className="space-y-4">
                  {analysis.application_guidance.elevator_pitch && (
                    <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 space-y-2">
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Quote className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                        30-Second Elevator Pitch
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        "{analysis.application_guidance.elevator_pitch}"
                      </p>
                    </div>
                  )}

                  {analysis.application_guidance.cover_letter_hook && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.08] space-y-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                        Compelling Cover Letter Hook
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                        "{analysis.application_guidance.cover_letter_hook}"
                      </p>
                    </div>
                  )}

                  {analysis.application_guidance.talking_points_for_gaps && (
                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        Interview Talking Points for Skill Gaps
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {analysis.application_guidance.talking_points_for_gaps}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Interview Focus Areas */}
              {analysis.interview_focus_areas && analysis.interview_focus_areas.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Anticipated Technical Interview Focus Areas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.interview_focus_areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="text-teal-500 dark:text-teal-400 font-bold">•</span>
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <KeywordAnalysis
              keywords={analysis.keyword_analysis?.top_keywords || []}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsList recommendations={analysis.recommendations} />
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <span>Recommended Alternative Career Opportunities</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Positions where your existing skill strengths give you high competitive leverage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analysis.job_recommendations?.map((job, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-colors"
                  >
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block mb-1">
                      {job}
                    </span>
                    <span className="text-xs text-emerald-500 dark:text-emerald-400">High Skill Transferability</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Level 3 Intelligence Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-400">
          OMEGA AI Intelligence Layer • Level 3 Hackathon Edition
        </p>
        <p>
          Multi-provider analysis architecture combining deterministic taxonomy matching, cloud/local LLM reasoning,
          interactive visual gap analytics, and dynamic mock interview simulation.
        </p>
      </div>
    </div>
  );
};
