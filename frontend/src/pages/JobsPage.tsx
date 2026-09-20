import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Bookmark, 
} from 'lucide-react';
import { jobsAPI } from '../services/api';
import type { JobOpportunity, JobSearchResultItem } from '../types';
import { JobCard } from '../components/jobs/JobCard';
import { SkeletonCard } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const JobsPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  
  const [searchResults, setSearchResults] = useState<JobSearchResultItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobOpportunity[]>([]);
  const [savedStatusFilter, setSavedStatusFilter] = useState<string>('all');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExploreJobs();
    loadSavedJobs();
  }, []);

  const loadExploreJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobsAPI.search({
        q: searchQuery,
        remote: remoteOnly,
        skill: skillFilter,
      });
      setSearchResults(data);
    } catch {
      showToast('Failed to fetch job opportunities.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const data = await jobsAPI.getSaved();
      setSavedJobs(data);
    } catch {
      // non-blocking
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadExploreJobs();
  };

  const handleSaveJob = async (jobItem: JobSearchResultItem) => {
    try {
      await jobsAPI.saveJob({
        title: jobItem.title,
        company: jobItem.company,
        location: jobItem.location,
        workplace_type: jobItem.workplace_type,
        salary_range: jobItem.salary_range,
        status: 'saved',
        job_description: jobItem.full_description,
        url: jobItem.apply_url,
      });
      showToast(`Saved "${jobItem.title}" to your tracking board.`, 'success');
      loadSavedJobs();
    } catch {
      showToast('Failed to save job.', 'error');
    }
  };

  const handleUpdateStatus = async (jobId: number, newStatus: string) => {
    try {
      await jobsAPI.updateStatus(jobId, { status: newStatus });
      showToast(`Status updated to ${newStatus}.`, 'success');
      loadSavedJobs();
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await jobsAPI.deleteJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast('Removed job from board.', 'success');
    } catch {
      showToast('Failed to remove job.', 'error');
    }
  };

  const filteredSavedJobs = savedJobs.filter((job) => {
    if (savedStatusFilter === 'all') return true;
    return job.status.toLowerCase() === savedStatusFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities & Pipeline Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover & Track Target Roles
          </h1>
          <p className="text-slate-400 text-sm">
            Explore curated tech postings, bookmark opportunities, and benchmark your resume compatibility in one click.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#13171a] border border-white/[0.08] self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Postings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Board ({savedJobs.length})</span>
          </button>
        </div>
      </div>

      {/* EXPLORE TAB */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search Filter Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-4 rounded-2xl bg-[#13171a] border border-white/[0.08] flex flex-col md:flex-row items-center gap-3 shadow-xl"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, company, or domain (e.g. Full Stack, Stripe, AI)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0d1114] border border-white/[0.08] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Required Tech (e.g. Python)"
                className="px-3 py-2 rounded-xl bg-[#0d1114] border border-white/[0.08] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full md:w-44"
              />

              <label className="flex items-center gap-2 text-xs text-slate-300 whitespace-nowrap cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded bg-[#0d1114] border-white/[0.1] text-teal-500 focus:ring-teal-400"
                />
                <span>Remote Only</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 transition-colors shadow-md shadow-teal-500/20 shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No opportunities found"
              description="Try adjusting your keywords or clearing the remote filter to see more positions."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSkillFilter('');
                setRemoteOnly(false);
                loadExploreJobs();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobs.some((s) => s.title === job.title && s.company === job.company)}
                  onSave={handleSaveJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED BOARD TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Saved' },
              { id: 'saved', label: 'Bookmarked' },
              { id: 'applied', label: 'Applied' },
              { id: 'interviewing', label: 'Interviewing' },
              { id: 'offer', label: 'Offers' },
              { id: 'rejected', label: 'Archived' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSavedStatusFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                  savedStatusFilter === st.id
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold border-teal-300/30 shadow-md shadow-teal-500/20'
                    : 'bg-[#13171a] text-slate-400 border-white/[0.08] hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {filteredSavedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved jobs in this stage"
              description="Explore live job opportunities and bookmark them to track your application pipeline."
              actionLabel="Explore Opportunities"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSavedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={true}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
