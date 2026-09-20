import React from 'react';
import { Sparkles, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0d1114]/90 backdrop-blur-xl py-14 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20">
              <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">OMEGA Platform</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Job Application & Interview Coach • Level 3 Hackathon Edition</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] font-medium">
              <Cpu className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              FastAPI + Python 3.14
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              PostgreSQL + SQLAlchemy
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Multi-Model AI Intelligence
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>Designed for high-impact career matching, gap analytics, and structured AI interview coaching.</p>
          <p className="font-mono text-[11px]">Production & Hackathon Ready</p>
        </div>
      </div>
    </footer>
  );
};
