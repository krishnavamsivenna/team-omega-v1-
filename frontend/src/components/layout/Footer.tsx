import React from 'react';
import { Sparkles, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">OMEGA Platform</p>
              <p className="text-xs text-slate-500">AI Job Application & Interview Coach • Level 1 MVP</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              FastAPI + Python 3.14
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              PostgreSQL + SQLAlchemy
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Deterministic Baseline NLP Engine
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-600">
          Designed for high-impact career matching and structured interview readiness. Level 2 LLM Integration ready.
        </div>
      </div>
    </footer>
  );
};
