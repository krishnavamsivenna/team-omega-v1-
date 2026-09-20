import React from 'react';
import { FileText, Trash2, Calendar, Check, Layers } from 'lucide-react';
import type { Resume } from '../../types';
import { Badge } from '../common/Badge';

interface ResumeCardProps {
  resume: Resume;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  isSelected = false,
  onSelect,
  onDelete,
}) => {
  const formattedDate = new Date(resume.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
        isSelected
          ? 'bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/10'
          : 'bg-slate-900/60 dark:bg-[#111518] border-slate-800 hover:border-teal-500/30 hover:bg-[#13171a]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-white truncate">{resume.filename}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {resume.file_type}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {isSelected ? (
          <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        ) : onDelete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
            title="Delete resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {resume.parsed_data && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <Badge variant="teal" size="sm" icon={<Layers className="w-3 h-3" />}>
            {resume.parsed_data.skills?.length || 0} skills
          </Badge>
          {resume.parsed_data.contact?.email && (
            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {resume.parsed_data.contact.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
