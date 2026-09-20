import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  Target,
  Code2,
  MessageSquare,
  FileCheck2
} from 'lucide-react';
import type { AnswerEvaluation } from '../../types';
import { RadarChart } from '../charts/RadarChart';

interface EvaluationReportProps {
  evaluation: AnswerEvaluation;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation }) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    if (score >= 60) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleCopy = () => {
    if (evaluation.improved_answer) {
      navigator.clipboard.writeText(evaluation.improved_answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pillars = [
    {
      title: 'Relevance',
      icon: Target,
      score: evaluation.relevance.score,
      feedback: evaluation.relevance.feedback,
    },
    {
      title: 'Technical Correctness',
      icon: Code2,
      score: evaluation.technical_correctness.score,
      feedback: evaluation.technical_correctness.feedback,
    },
    {
      title: 'Communication',
      icon: MessageSquare,
      score: evaluation.communication.score,
      feedback: evaluation.communication.feedback,
    },
    {
      title: 'Completeness',
      icon: FileCheck2,
      score: evaluation.completeness.score,
      feedback: evaluation.completeness.feedback,
    },
  ];

  const radarData = [
    { label: 'Relevance', value: evaluation.relevance.score, benchmark: 85 },
    { label: 'Technical', value: evaluation.technical_correctness.score, benchmark: 80 },
    { label: 'Communication', value: evaluation.communication.score, benchmark: 85 },
    { label: 'Completeness', value: evaluation.completeness.score, benchmark: 80 },
    { label: 'Overall', value: evaluation.overall_score, benchmark: 85 },
  ];

  return (
    <div className="mt-6 space-y-6 border-t border-slate-800 pt-6 animate-fadeIn">
      {/* Overall Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 dark:from-[#111518] dark:via-teal-950/30 dark:to-[#111518] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">AI Evaluation Feedback</h4>
            <p className="text-xs text-slate-400">Assessed across 4 objective interview rubrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Overall Score</span>
          <div className={`px-4 py-1.5 rounded-xl text-lg font-bold border ${getScoreColor(evaluation.overall_score)}`}>
            {Math.round(evaluation.overall_score)}%
          </div>
        </div>
      </div>

      {/* Evaluation Rubrics & Radar Vector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
        {/* 4 Pillars Grid (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-4 rounded-xl bg-slate-900/70 dark:bg-[#111518] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-medium text-slate-200">{pillar.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-100">{Math.round(pillar.score)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(pillar.score)}`}
                    style={{ width: `${Math.min(100, Math.max(0, pillar.score))}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.feedback}</p>
              </div>
            );
          })}
        </div>

        {/* Radar Performance Polygon (1 col) */}
        <div className="p-4 rounded-xl bg-slate-900/70 dark:bg-[#111518] border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Answer Vector</span>
          <RadarChart data={radarData} size={190} />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Growth Areas */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">Areas to Strengthen</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions */}
      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Coach's Recommended Adjustments</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Answer / Exemplar Toggle */}
      {evaluation.improved_answer && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 dark:bg-[#111518] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Exemplar Answer Formulation (Senior Level)</span>
            </div>
            {showModelAnswer ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showModelAnswer && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 dark:bg-[#0d1114] text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
              <p className="italic text-slate-300 whitespace-pre-line">{evaluation.improved_answer}</p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Model Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
