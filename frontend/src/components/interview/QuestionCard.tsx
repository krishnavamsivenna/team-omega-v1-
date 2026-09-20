import React, { useState } from 'react';
import { 
  Send, 
  HelpCircle, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  Loader2,
  Tag,
  Mic,
  MicOff,
} from 'lucide-react';
import type { InterviewQuestionAnswer } from '../../types';
import { EvaluationReport } from './EvaluationReport';

interface QuestionCardProps {
  question: InterviewQuestionAnswer;
  index: number;
  total: number;
  onSubmitAnswer: (questionId: number, answer: string) => Promise<void>;
  isSubmitting: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onSubmitAnswer,
  isSubmitting,
}) => {
  const [answer, setAnswer] = useState(question.user_answer || '');
  const [showCriteria, setShowCriteria] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const isAnswered = Boolean(question.evaluation);

  // Speech recognition setup
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wordCount < 10) {
      setError('Please write a substantive response (at least 10 words) for accurate evaluation.');
      return;
    }
    setError(null);
    try {
      await onSubmitAnswer(question.id, answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer.');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'behavioral':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'hr':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 dark:bg-[#13171a] border border-slate-800 p-6 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Question {index + 1} of {total}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getTypeBadge(question.question_type)}`}>
            {question.question_type}
          </span>
          {question.category && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
              <Tag className="w-3 h-3" />
              {question.category}
            </span>
          )}
        </div>

        {isAnswered && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/60">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Answered & Evaluated</span>
          </div>
        )}
      </div>

      {/* Question Prompt */}
      <div className="py-5">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-100 leading-snug">
          {question.question_text}
        </h3>

        {/* Expected Criteria toggle */}
        {question.expected_criteria && question.expected_criteria.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowCriteria(!showCriteria)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showCriteria ? 'Hide interviewer evaluation criteria' : 'View what the interviewer looks for'}</span>
            </button>

            {showCriteria && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950 dark:bg-[#0d1114] border border-slate-800/80 text-xs text-slate-300 animate-fadeIn">
                <span className="font-semibold text-slate-200 block mb-1.5">Expected Rubric / Competencies:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {question.expected_criteria.map((crit, cIdx) => (
                    <li key={cIdx}>{crit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Response
            </label>
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Recording (Click to stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dictate Answer</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Structure your thoughts clearly. Outline context, technical steps taken, trade-offs, and measurable outcomes..."
            rows={5}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 dark:bg-[#0d1114] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-sm leading-relaxed transition-all resize-y disabled:opacity-50"
          />
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-1">
            <span>{wordCount} words {wordCount < 10 && '(minimum 10 words recommended)'}</span>
            <span>Use the STAR framework for behavioral or architecture trade-offs for technical questions</span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-800/50">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {isAnswered && (
            <button
              type="button"
              onClick={() => {
                // Allow re-answering
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refine Answer</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || wordCount < 5}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>AI Evaluating...</span>
              </>
            ) : isAnswered ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Re-evaluate Response</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit for Evaluation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Render AI Evaluation if evaluated */}
      {question.evaluation && (
        <EvaluationReport evaluation={question.evaluation} />
      )}
    </div>
  );
};
