import React from 'react';
import { Briefcase, Building2, Award, AlignLeft } from 'lucide-react';
import { Input } from '../common/Input';
import { SampleJobSelector } from './SampleJobSelector';
import type { SampleJob } from './SampleJobSelector';

interface JobDescriptionFormProps {
  title: string;
  setTitle: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  experienceLevel: string;
  setExperienceLevel: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  errors?: {
    title?: string;
    jobDescription?: string;
  };
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({
  title,
  setTitle,
  company,
  setCompany,
  experienceLevel,
  setExperienceLevel,
  jobDescription,
  setJobDescription,
  errors = {},
}) => {
  const handleSampleSelect = (job: SampleJob) => {
    setTitle(job.title);
    setCompany(job.company);
    setExperienceLevel(job.experience_level);
    setJobDescription(job.description);
  };

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5">
      {/* Sample Job Picker for instant testing */}
      <SampleJobSelector onSelect={handleSampleSelect} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Job Title *"
          placeholder="e.g. Senior Full Stack Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          icon={<Briefcase className="w-4 h-4" />}
          required
        />
        <Input
          label="Target Company"
          placeholder="e.g. Stripe, Google, or Stealth Startup"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          icon={<Building2 className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Seniority Level
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Award className="w-4 h-4" />
            </div>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-100 text-sm pl-10 pr-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2"
            >
              <option value="Junior / Entry (0-2 yrs)">Junior / Entry (0-2 yrs)</option>
              <option value="Mid-Level (2-4 yrs)">Mid-Level (2-4 yrs)</option>
              <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
              <option value="Staff / Lead (8+ yrs)">Staff / Lead (8+ yrs)</option>
              <option value="Executive / Director">Executive / Director</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              Full Job Description *
            </span>
            <span className="text-[11px] text-slate-500 lowercase font-normal">
              {wordCount} words • {jobDescription.length} characters
            </span>
          </label>
          <textarea
            rows={7}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job requirements, responsibilities, and target qualifications here..."
            className={`w-full rounded-xl bg-slate-900/90 border ${
              errors.jobDescription
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
            } text-slate-100 placeholder-slate-500 text-sm p-3.5 transition-all duration-200 focus:outline-none focus:ring-2`}
          />
          {errors.jobDescription && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.jobDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
};
