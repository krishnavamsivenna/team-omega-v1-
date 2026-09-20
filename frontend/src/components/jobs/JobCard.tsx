import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Sparkles
} from 'lucide-react';
import type { JobOpportunity, JobSearchResultItem } from '../../types';

interface JobCardProps {
  job: JobOpportunity | JobSearchResultItem;
  isSaved?: boolean;
  onSave?: (job: JobSearchResultItem) => Promise<void>;
  onUpdateStatus?: (jobId: number, status: string) => Promise<void>;
  onDelete?: (jobId: number) => Promise<void>;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onSave,
  onUpdateStatus,
  onDelete,
}) => {
  const navigate = useNavigate();

  const isSavedModel = 'status' in job;
  const title = job.title;
  const company = job.company;
  const location = job.location;
  const workplaceType = job.workplace_type;
  const salaryRange = job.salary_range;
  const description = isSavedModel ? job.job_description : job.full_description;
  const matchScore = isSavedModel ? job.match_score : null;
  const externalUrl = isSavedModel ? job.url : (job as JobSearchResultItem).apply_url;
  const requiredSkills: string[] = isSavedModel ? [] : (job as JobSearchResultItem).required_skills || [];

  const handleMatchWithResume = () => {
    navigate('/analyze', {
      state: {
        jobTitle: title,
        company: company,
        jobDescription: description,
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offer':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
      case 'interviewing':
        return 'bg-teal-950/40 text-teal-400 border-teal-800/60';
      case 'applied':
        return 'bg-cyan-950/40 text-cyan-400 border-cyan-800/60';
      case 'rejected':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111518]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-teal-500/40 transition-all flex flex-col justify-between gap-4 backdrop-blur-xl">
      {/* Top Details */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                {company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {location}
              </span>
            </div>
          </div>

          {matchScore !== null && matchScore !== undefined && (
            <div className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-bold shrink-0">
              {Math.round(matchScore)}% Match
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            {workplaceType}
          </span>
          {salaryRange && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
              <DollarSign className="w-3 h-3" />
              {salaryRange}
            </span>
          )}
          {isSavedModel && (
            <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wider ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          )}
        </div>

        {/* Short Job Description Preview */}
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Required Skills Chips */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {requiredSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]"
              >
                {skill}
              </span>
            ))}
            {requiredSkills.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-3">
          {isSavedModel ? (
            <select
              value={job.status}
              onChange={(e) => onUpdateStatus && onUpdateStatus(job.id, e.target.value)}
              className="bg-slate-100 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              <option value="saved">Pipeline: Saved</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Archived</option>
            </select>
          ) : isSaved ? (
            <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-medium">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSave && onSave(job as JobSearchResultItem)}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Job</span>
            </button>
          )}

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-[11px]">Listing</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSavedModel && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(job.id)}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Remove
            </button>
          )}

          <button
            type="button"
            onClick={handleMatchWithResume}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Match Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};
