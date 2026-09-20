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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analysisAPI, resumeAPI } from '../services/api';
import type { AnalysisHistoryItem, Resume } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { ResumeDropzone } from '../components/resume/ResumeDropzone';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyData, resumesData] = await Promise.all([
        analysisAPI.getHistory(),
        resumeAPI.list(),
      ]);
      setHistory(historyData);
      setResumes(resumesData);
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

  // Calculations
  const totalAnalyses = history.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.overall_score, 0) / totalAnalyses)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading dashboard metrics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Overview</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Level 1 MVP Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.full_name || user?.email}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your job match iterations, manage resumes, and benchmark technical alignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Resume
          </Button>
          <Link to="/analyze">
            <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
              New Match Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Analyses Executed</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{totalAnalyses}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Average Match Score</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {avgScore}%
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Resumes in Library</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{resumes.length}</p>
          </div>
        </Card>
      </div>

      {/* Recent Match Analyses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Recent Match Analyses</h3>
          </div>
          {history.length > 0 && (
            <span className="text-xs text-slate-500">{history.length} completed reports</span>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">No analyses yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Compare your resume against any job description to discover your match score and skill gaps.
              </p>
            </div>
            <Link to="/analyze">
              <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                Run Your First Analysis
              </Button>
            </Link>
          </Card>
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
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
                  : item.overall_score >= 60
                  ? 'text-amber-400 border-amber-500/30 bg-amber-950/30'
                  : 'text-rose-400 border-rose-500/30 bg-rose-950/30';

              return (
                <Card
                  key={item.id}
                  hoverEffect
                  className="flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-base font-bold text-white truncate">{item.job_title}</h4>
                      <p className="text-xs text-slate-400 truncate">
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

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.matched_skills_count} Matched
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {item.missing_skills_count} Gaps
                    </span>
                    <span className="ml-auto text-[11px] text-slate-500">{formattedDate}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleDeleteAnalysis(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
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

      {/* Resumes Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Your Resumes Library</h3>
          </div>
          <span className="text-xs text-slate-500">{resumes.length} saved</span>
        </div>

        {resumes.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-xs text-slate-400">No resumes uploaded to your profile yet.</p>
            <Button
              variant="outline"
              size="sm"
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload a Resume
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {resumes.map((resume) => {
              const formattedDate = new Date(resume.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <Card key={resume.id} hoverEffect className="p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{resume.filename}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {resume.file_type}
                        </span>
                        <span className="text-[11px] text-slate-500">{formattedDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {resume.parsed_data && (
                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Layers className="w-3.5 h-3.5" />
                        {resume.parsed_data.skills?.length || 0} skills parsed
                      </span>
                      <button
                        onClick={() => navigate('/analyze', { state: { resumeId: resume.id } })}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        Use in Match
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
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
