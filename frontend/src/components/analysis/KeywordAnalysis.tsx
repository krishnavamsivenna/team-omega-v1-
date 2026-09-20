import React from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import type { KeywordFrequency } from '../../types';

interface KeywordAnalysisProps {
  keywords: KeywordFrequency[];
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-xs">
        No specific keyword density metrics available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-sky-400" />
          Top Job Keywords vs. Resume Frequency
        </h4>
        <span className="text-[11px] text-slate-500">Essential terminology scanned by ATS bots</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Term / Keyword</th>
              <th className="px-4 py-3 text-center">Mentions in JD</th>
              <th className="px-4 py-3 text-center">Mentions in Resume</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {keywords.map((kw, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  {kw.keyword}
                </td>
                <td className="px-4 py-2.5 text-center font-mono text-slate-300">
                  {kw.jd_count}
                </td>
                <td className="px-4 py-2.5 text-center font-mono">
                  <span
                    className={`font-semibold ${
                      kw.resume_count > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {kw.resume_count}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {kw.match_status === 'matched' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> Included
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-500/20">
                      <XCircle className="w-3 h-3" /> Missing
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
