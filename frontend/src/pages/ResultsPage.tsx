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
} from 'lucide-react';
import { analysisAPI } from '../services/api';
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

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'keywords' | 'recommendations' | 'resume'>('skills');

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
        <h3 className="text-lg font-bold text-white">Report Not Found</h3>
        <p className="text-xs text-slate-400">The requested analysis result could not be located.</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:py-0 print:px-0">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Export / Print Report
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Match Report
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {analysis.job_title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {analysis.company || 'Target Organization'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Resume #{analysis.resume_id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                <Cpu className="w-3 h-3 text-indigo-400" />
                {analysis.provider_name}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Score Section: Gauge + 4 Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Radial Gauge Card */}
        <Card className="lg:col-span-1 p-8 flex flex-col items-center justify-center min-h-[300px]">
          <ScoreGauge score={analysis.overall_score} size={190} />
          <div className="text-center mt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Overall Readiness Match
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Weighted calculation across technical competencies, domain keywords, and ATS structure.
            </p>
          </div>
        </Card>

        {/* Right Sub-score Breakdowns */}
        <div className="lg:col-span-2">
          <ScoreCard breakdown={analysis.scores_breakdown} />
        </div>
      </div>

      {/* Interactive Tabs for In-Depth Drilldowns */}
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-indigo-500 text-white bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Skill Gap Matrix ({analysis.matched_skills.length + analysis.missing_skills.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'keywords'
                ? 'border-indigo-500 text-white bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                ? 'border-indigo-500 text-white bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Actionable Optimization Checklist ({analysis.recommendations.length})
          </button>
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

          {activeTab === 'keywords' && (
            <KeywordAnalysis
              keywords={analysis.keyword_analysis?.top_keywords || []}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsList recommendations={analysis.recommendations} />
          )}
        </Card>
      </div>

      {/* Honest Level 1 Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500 text-center space-y-1">
        <p className="font-semibold text-slate-400">
          OMEGA Platform Level 1 Architecture Notice
        </p>
        <p>
          This evaluation was executed using deterministic natural language processing, standardized skill ontologies,
          and vector cosine similarity. Level 2 will introduce autonomous AI mock interview coaching and LLM conversational reasoning.
        </p>
      </div>
    </div>
  );
};
