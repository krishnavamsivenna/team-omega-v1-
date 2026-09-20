import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Play,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { resumeAPI, analysisAPI } from '../services/api';
import type { Resume } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ResumeDropzone } from '../components/resume/ResumeDropzone';
import { JobDescriptionForm } from '../components/job/JobDescriptionForm';
import { ResumeCard } from '../components/resume/ResumeCard';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Job description form state
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior (3-5 years)');
  const [jobDescription, setJobDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{ title?: string; jobDescription?: string }>({});

  // Analysis running & phased loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await resumeAPI.list();
        setResumes(data);
        // If navigation state has a preselected resumeId:
        const preselectedId = (location.state as { resumeId?: number })?.resumeId;
        if (preselectedId) {
          const match = data.find((r) => r.id === preselectedId);
          if (match) setSelectedResume(match);
        } else if (data.length > 0) {
          setSelectedResume(data[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load resumes';
        showToast(msg, 'error');
      }
    };

    fetchResumes();
  }, [location.state]);

  const validateForm = () => {
    const errs: { title?: string; jobDescription?: string } = {};
    if (!jobTitle.trim()) {
      errs.title = 'Job title is required.';
    }
    if (!jobDescription.trim()) {
      errs.jobDescription = 'Job description is required.';
    } else if (jobDescription.trim().length < 50) {
      errs.jobDescription = 'Please provide a detailed job description (minimum 50 characters).';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStartAnalysis = async () => {
    if (!selectedResume) {
      showToast('Please upload or select a resume before running the analysis.', 'warning');
      return;
    }
    if (!validateForm()) {
      showToast('Please complete all required job description fields.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisPhase('Extracting skills and structural sections from resume...');

    // Simulated phase steps for user feedback
    const timer1 = setTimeout(() => {
      setAnalysisPhase('Parsing job description requirements and domain keywords...');
    }, 600);
    const timer2 = setTimeout(() => {
      setAnalysisPhase('Calculating TF-IDF cosine relevance and ATS readability score...');
    }, 1200);
    const timer3 = setTimeout(() => {
      setAnalysisPhase('Isolating skill gaps and formulating optimization tips...');
    }, 1800);

    try {
      const response = await analysisAPI.match({
        resume_id: selectedResume.id,
        job_title: jobTitle.trim(),
        company: company.trim() || 'Target Company',
        experience_level: experienceLevel,
        job_description: jobDescription.trim(),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      showToast('Match analysis completed successfully!', 'success');
      navigate(`/results/${response.id}`);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      showToast(msg, 'error');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Level 1 Matching Engine
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">New Resume Match Analysis</h1>
        <p className="text-xs text-slate-400">
          Select your resume, enter the target job description, and benchmark your readiness against the role.
        </p>
      </div>

      {/* Main Analysis Setup Form */}
      <div className="space-y-8">
        {/* Step 1: Resume Selection & Upload */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-white">Select or Upload Resume</h3>
            </div>
            {selectedResume && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Selected: {selectedResume.filename}
              </span>
            )}
          </div>

          {/* Existing Resumes selector if available */}
          {resumes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose from your saved resumes:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {resumes.map((r) => (
                  <ResumeCard
                    key={r.id}
                    resume={r}
                    isSelected={selectedResume?.id === r.id}
                    onSelect={() => setSelectedResume(r)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload or paste new */}
          <div className="pt-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {resumes.length > 0 ? 'Or upload a new version:' : 'Upload your resume:'}
            </span>
            <ResumeDropzone
              selectedResume={selectedResume}
              onParsed={(newResume) => {
                setResumes((prev) => [newResume, ...prev]);
                setSelectedResume(newResume);
              }}
            />
          </div>
        </Card>

        {/* Step 2: Target Job Description */}
        <Card className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-bold text-white">Target Job Description</h3>
          </div>

          <JobDescriptionForm
            title={jobTitle}
            setTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            errors={formErrors}
          />
        </Card>

        {/* Step 3: Execution CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl shadow-indigo-500/5">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Ready to execute match evaluation?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculates skill gap matrix, TF-IDF vector alignment, ATS compliance, and tailored advice.
            </p>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={handleStartAnalysis}
            isLoading={isAnalyzing}
            icon={<Play className="w-4 h-4 fill-white" />}
            className="w-full sm:w-auto shrink-0"
          >
            {isAnalyzing ? 'Analyzing Alignment...' : 'Run Match Analysis'}
          </Button>
        </div>
      </div>

      {/* Analysis In-Progress Modal Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Analyzing Your Match</h3>
              <p className="text-xs text-indigo-300 font-medium min-h-[32px] transition-all">
                {analysisPhase}
              </p>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse-glow" style={{ width: '100%' }} />
            </div>

            <p className="text-[11px] text-slate-500">
              Powered by OMEGA Baseline Engine • Level 2 LLM Integration Ready
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
