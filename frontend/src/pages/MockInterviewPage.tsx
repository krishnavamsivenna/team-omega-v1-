import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Clock, 
  CheckCircle2, 
  Award, 
  Play, 
  Plus, 
  History, 
  Loader2, 
} from 'lucide-react';

import { interviewAPI, resumeAPI } from '../services/api';
import type { 
  InterviewSession, 
  InterviewSessionSummary, 
  Resume,
  CreateInterviewRequest 
} from '../types';
import { QuestionCard } from '../components/interview/QuestionCard';

export const MockInterviewPage: React.FC = () => {
  // Setup form state
  const [role, setRole] = useState('Senior Full Stack Engineer');
  const [level, setLevel] = useState('Mid-Senior (3-5 yrs)');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'hr' | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState(4);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [resumes, setResumes] = useState<Resume[]>([]);

  // Session runner state
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [history, setHistory] = useState<InterviewSessionSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial resumes & history
  useEffect(() => {
    loadResumes();
    loadHistory();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeAPI.list();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch {
      // Non-blocking if resumes fail to load
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await interviewAPI.getHistory();
      setHistory(data);
    } catch {
      // Non-blocking
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      setError('Please specify a target job role.');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      const payload: CreateInterviewRequest = {
        job_role: role.trim(),
        experience_level: level,
        interview_type: interviewType,
        resume_id: selectedResumeId,
        question_count: questionCount,
      };

      const session = await interviewAPI.generate(payload);
      setActiveSession(session);
      setCurrentQIndex(0);
      loadHistory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPastSession = async (sessionId: number) => {
    try {
      setError(null);
      setIsGenerating(true);
      const session = await interviewAPI.getSession(sessionId);
      setActiveSession(session);
      setCurrentQIndex(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load past session.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async (questionId: number, answer: string) => {
    if (!activeSession) return;
    try {
      setIsSubmittingAnswer(true);
      const updatedQA = await interviewAPI.evaluateAnswer({
        session_id: activeSession.id,
        question_id: questionId,
        user_answer: answer,
      });

      // Update question in active session
      const updatedQuestions = activeSession.questions.map((q) =>
        q.id === questionId ? updatedQA : q
      );

      // Refresh session from API to get latest overall_score
      const freshSession = await interviewAPI.getSession(activeSession.id);
      setActiveSession({
        ...freshSession,
        questions: updatedQuestions,
      });
      loadHistory();
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const answeredCount = activeSession
    ? activeSession.questions.filter((q) => q.score !== null && q.score !== undefined).length
    : 0;

  const totalQuestions = activeSession ? activeSession.questions.length : 0;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Mock Interview Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            High-Signal Interview Coaching
          </h1>
          <p className="text-slate-400 text-sm">
            Practice real-world technical, behavioral, and HR questions with instant multi-axis AI evaluation.
          </p>
        </div>

        {activeSession && (
          <button
            type="button"
            onClick={() => setActiveSession(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors self-start sm:self-center border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Interview Session</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main View: Setup OR Active Session */}
      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111518]/90 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                <span>Configure Your Interview Round</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Choose your target parameters. Our AI will dynamically synthesize realistic questions and benchmark rubrics.
              </p>

              <form onSubmit={handleStartInterview} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Target Role / Job Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Backend Architect, Frontend Engineer, DevOps Specialist"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0d1114] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Seniority / Experience Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0d1114] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    >
                      <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                      <option value="Mid-Level (2-4 yrs)">Mid-Level (2-4 yrs)</option>
                      <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                      <option value="Lead / Staff (8+ yrs)">Lead / Staff (8+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Questions Count
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0d1114] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    >
                      <option value={3}>3 Questions (Express Practice)</option>
                      <option value={4}>4 Questions (Standard Interview)</option>
                      <option value={6}>6 Questions (In-Depth Simulation)</option>
                    </select>
                  </div>
                </div>

                {/* Interview Category Cards */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Interview Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'mixed', label: 'Mixed Round', desc: 'Tech + Behavioral + HR' },
                      { id: 'technical', label: 'Technical', desc: 'Architecture & Coding' },
                      { id: 'behavioral', label: 'Behavioral', desc: 'STAR Framework & Conflict' },
                      { id: 'hr', label: 'HR / Culture', desc: 'Motivation & Growth Fit' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setInterviewType(cat.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          interviewType === cat.id
                            ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 shadow-md shadow-teal-500/10'
                            : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.15]'
                        }`}
                      >
                        <span className="font-semibold text-xs block mb-0.5">{cat.label}</span>
                        <span className="text-[11px] text-slate-500 leading-tight block">{cat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Resume Link */}
                {resumes.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Personalize with Your Resume (Optional)
                    </label>
                    <select
                      value={selectedResumeId ?? ''}
                      onChange={(e) => setSelectedResumeId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0d1114] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    >
                      <option value="">No Resume (Generic Role Questions)</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.filename} ({new Date(r.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Synthesizing Interview Session...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Launch AI Mock Interview</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Past Sessions Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111518]/90 border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                <span>Recent Practice Sessions</span>
              </h3>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No previous sessions yet. Start your first round to build performance benchmarks!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {history.map((sess) => (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => handleSelectPastSession(sess.id)}
                      className="w-full text-left p-3.5 rounded-xl bg-[#0d1114] border border-white/[0.08] hover:border-teal-500/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-teal-400 truncate">
                          {sess.job_role}
                        </span>
                        {sess.overall_score !== null && sess.overall_score !== undefined && (
                          <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/50">
                            {Math.round(sess.overall_score)}%
                          </span>
                        )}

                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="capitalize">{sess.interview_type} • {sess.answered_count}/{sess.questions_count} Qs</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sess.created_at).toLocaleDateString()}
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
        /* Active Interview Runner */
        <div className="space-y-6">
          {/* Active Session Info Header */}
          <div className="p-6 rounded-3xl bg-[#13171a] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 uppercase tracking-wider">
                  {activeSession.interview_type} Session
                </span>
                <span className="text-xs text-slate-400">
                  {activeSession.experience_level}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {activeSession.job_role}
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-[#0d1114] px-5 py-3 rounded-2xl border border-white/[0.08]">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Answered</span>
                <span className="text-base font-bold text-slate-100">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Session Avg</span>
                <span className={`text-base font-bold ${activeSession.overall_score ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeSession.overall_score ? `${Math.round(activeSession.overall_score)}%` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Question Stepper Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {activeSession.questions.map((q, idx) => {
              const answered = q.score !== null && q.score !== undefined;
              const isCurrent = idx === currentQIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold border-teal-300/30 shadow-md shadow-teal-500/20'
                      : answered
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : 'bg-[#13171a] text-slate-400 border-white/[0.08] hover:text-slate-200'
                  }`}
                >
                  {answered && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Q{idx + 1}</span>
                  {answered && <span>({Math.round(q.score || 0)}%)</span>}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          {activeSession.questions[currentQIndex] && (
            <QuestionCard
              question={activeSession.questions[currentQIndex]}
              index={currentQIndex}
              total={totalQuestions}
              onSubmitAnswer={handleSubmitAnswer}
              isSubmitting={isSubmittingAnswer}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Previous Question
            </button>

            <span className="text-xs text-slate-500">
              Question {currentQIndex + 1} of {totalQuestions}
            </span>

            <button
              type="button"
              onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentQIndex === totalQuestions - 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Next Question →
            </button>
          </div>

          {/* Session Complete Final Scorecard Banner */}
          {isAllAnswered && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#13171a] to-teal-950/40 border border-teal-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mock Interview Round Completed!</h3>
                  <p className="text-xs text-slate-400">
                    All {totalQuestions} questions evaluated. Your final aggregated score is {Math.round(activeSession.overall_score || 0)}%.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSession(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 transition-colors shadow-lg shadow-teal-500/20"
                >
                  Start Another Round
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
