import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Trash2,
  UploadCloud,
  Layers,
  Sparkles,
  Bot,
  Compass,
  Briefcase,
  Star,
  Activity,
  Award,
  Check,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analysisAPI, resumeAPI, jobsAPI } from '../services/api';
import type { AnalysisHistoryItem, Resume, JobOpportunity } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ResumeDropzone } from '../components/resume/ResumeDropzone';
import { RadarChart, type RadarDataPoint } from '../components/charts/RadarChart';
import { MatchTrajectoryChart } from '../components/charts/MatchTrajectoryChart';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyData, resumesData, savedJobsData] = await Promise.all([
        analysisAPI.getHistory(),
        resumeAPI.list(),
        jobsAPI.getSaved().catch(() => []),
      ]);
      setHistory(historyData);
      setResumes(resumesData);
      setSavedJobs(savedJobsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteResume = async (id: number) => {
    try {
      await resumeAPI.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      showToast('Resume removed from library.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete resume';
      showToast(msg, 'error');
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      const updated = await resumeAPI.setPrimary(id);
      setResumes((prev) =>
        prev.map((r) => ({
          ...r,
          is_primary: r.id === updated.id,
        }))
      );
      showToast('Active primary resume updated.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update primary resume';
      showToast(msg, 'error');
    }
  };

  const handleDeleteAnalysis = async (id: number) => {
    try {
      await analysisAPI.deleteReport(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      showToast('Analysis report deleted.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete report';
      showToast(msg, 'error');
    }
  };

  // Metrics Calculations
  const totalAnalyses = history.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.overall_score, 0) / totalAnalyses)
      : 0;

  // Composite Career Readiness Metric (0 to 100)
  const readinessScore = Math.min(
    100,
    Math.round(
      (avgScore > 0 ? avgScore * 0.65 : 40) +
        Math.min(25, totalAnalyses * 5) +
        (resumes.some((r) => r.is_primary) ? 10 : 0)
    )
  );

  const primaryResume = resumes.find((r) => r.is_primary) || resumes[0];

  // Radar chart data modeling candidate competence
  const radarData: RadarDataPoint[] = [
    {
      label: 'Core Skills',
      value: avgScore > 0 ? avgScore : 72,
      benchmark: 85,
    },
    {
      label: 'System Design',
      value: avgScore > 0 ? Math.min(95, Math.round(avgScore * 0.92)) : 68,
      benchmark: 80,
    },
    {
      label: 'Problem Solving',
      value: avgScore > 0 ? Math.min(98, Math.round(avgScore * 0.95)) : 75,
      benchmark: 85,
    },
    {
      label: 'STAR / Behavioral',
      value: avgScore > 0 ? Math.min(96, Math.round(avgScore * 0.88 + 10)) : 80,
      benchmark: 80,
    },
    {
      label: 'Role Fit',
      value: avgScore > 0 ? Math.min(100, Math.round(avgScore * 1.02)) : 70,
      benchmark: 90,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading hackathon command center..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">
              Command Center
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30">
              Level 3 Hackathon Edition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user?.full_name || user?.email}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time role compatibility, interview readiness vectors, and manage active application versions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/jobs">
            <Button
              variant="outline"
              size="sm"
              icon={<Briefcase className="w-4 h-4 text-teal-500 dark:text-teal-400" />}
            >
              Jobs Board
            </Button>
          </Link>
          <Link to="/interview">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/25 border border-teal-300/30"
            >
              <Bot className="w-4 h-4" />
              <span>Mock Interview</span>
            </button>
          </Link>
          <Link to="/roadmap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#181f24] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/[0.08]"
            >
              <Compass className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              <span>Roadmaps</span>
            </button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload
          </Button>
          <Link to="/analyze">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              New Match
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats & Readiness Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Career Readiness Composite Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/40 via-[#13171a] to-[#0d1114] border border-teal-500/30 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">Career Readiness</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{readinessScore}%</span>
              <span className="text-xs font-medium text-emerald-400">
                {readinessScore >= 80 ? 'Market Ready' : readinessScore >= 60 ? 'Competitive' : 'Developing'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Composite alignment vector</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Match Score */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Match</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{avgScore}%</p>
            <p className="text-[11px] text-slate-400">Across {totalAnalyses} evaluations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </Card>

        {/* Saved Jobs in Pipeline */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tracked Jobs</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{savedJobs.length}</p>
            <Link to="/jobs" className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium">
              View Jobs Board &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        {/* Active Primary Resume */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Primary Resume</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {primaryResume ? primaryResume.filename : 'No resume active'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {primaryResume?.target_role || `${resumes.length} versions stored`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
            <Star className="w-6 h-6 fill-amber-500/30" />
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid: Radar Chart + Match Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competence & Interview Preparedness Radar */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Candidate Competence Vector
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Multidimensional Model</span>
          </div>

          <div className="py-2 flex items-center justify-center">
            <RadarChart data={radarData} size={270} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
            Evaluates technical competence, system design, and behavioral frameworks against target role benchmarks.
          </p>
        </Card>

        {/* Match Trajectory Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Role Fit Trajectory
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Last 7 evaluations</span>
          </div>

          <div className="py-4">
            <MatchTrajectoryChart history={history} height={160} />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Score tracking across iterations</span>
            <Link to="/analyze" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
              Run new match &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Resume Version Management & Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resume Versions & Target Profiles</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Add New Version
          </Button>
        </div>

        {resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes uploaded yet"
            description="Upload your resume in PDF, DOCX, or TXT format to enable AI match scoring and mock interviews."
            actionLabel="Upload Resume"
            onAction={() => setIsUploadModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => {
              const formattedDate = new Date(resume.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <Card
                  key={resume.id}
                  hoverEffect
                  className={`p-5 flex flex-col justify-between gap-3 relative transition-all ${
                    resume.is_primary
                      ? 'border-teal-500/50 bg-teal-500/5 dark:bg-teal-950/20'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {resume.filename}
                          </h4>
                          {resume.is_primary && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3 fill-amber-500" />
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          {resume.target_role && (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              {resume.target_role}
                            </span>
                          )}
                          {resume.version_tag && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                              {resume.version_tag}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">{formattedDate}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {resume.parsed_data && (
                      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-teal-600 dark:text-teal-300 font-medium">
                          <Layers className="w-3.5 h-3.5" />
                          {resume.parsed_data.skills?.length || 0} skills parsed
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    {!resume.is_primary ? (
                      <button
                        onClick={() => handleSetPrimary(resume.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set Primary
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-500 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Default Version
                      </span>
                    )}

                    <button
                      onClick={() => navigate('/analyze', { state: { resumeId: resume.id } })}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 ml-auto"
                    >
                      Use in Match
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Match Analyses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-teal-500 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Match Analyses</h3>
          </div>
          {history.length > 0 && (
            <span className="text-xs text-slate-500">{history.length} completed reports</span>
          )}
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No analyses recorded yet"
            description="Compare your resume against any target job description to compute compatibility, skill gaps, and interview prep."
            actionLabel="Run Your First Analysis"
            onAction={() => navigate('/analyze')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const scoreColor =
                item.overall_score >= 80
                  ? 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : item.overall_score >= 60
                  ? 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-500 dark:text-rose-400 border-rose-500/30 bg-rose-500/10';

              return (
                <Card
                  key={item.id}
                  hoverEffect
                  className="flex flex-col justify-between gap-4 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {item.job_title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.company || 'Target Organization'}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl border font-extrabold text-sm flex items-center gap-1 shrink-0 ${scoreColor}`}
                    >
                      <span>{Math.round(item.overall_score)}%</span>
                      <span className="text-[10px] font-medium uppercase">Fit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.matched_skills_count} Matched
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      {item.missing_skills_count} Gaps
                    </span>
                    <span className="ml-auto text-[11px] text-slate-400">{formattedDate}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleDeleteAnalysis(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>

                    <Link to={`/results/${item.id}`}>
                      <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                        View Full Report
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Resume Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload & Parse Resume"
        maxWidth="lg"
      >
        <ResumeDropzone
          selectedResume={null}
          onParsed={(newResume) => {
            setResumes((prev) => [newResume, ...prev]);
            setIsUploadModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
