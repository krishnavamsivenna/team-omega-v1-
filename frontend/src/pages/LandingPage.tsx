import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  Cpu,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 overflow-hidden">
        {/* Background glow ambient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>OMEGA Level 1 MVP Foundation Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            AI-Powered Resume Matching &{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              Interview Coaching
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop sending blind job applications. Upload your resume, paste target job descriptions,
            and instantly uncover critical skill gaps, ATS keyword alignment, and actionable interview tips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                    Start Free Analysis
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" onClick={handleDemoClick} icon={<Zap className="w-4 h-4 text-amber-400" />}>
                  Instant Demo Access
                </Button>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Core Engine</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">FastAPI & Python 3.14</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Database</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">PostgreSQL / SQLAlchemy</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Parsing Support</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">PDF, DOCX, TXT</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Matching Model</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">Deterministic NLP & Vector</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Engineered For Job Seekers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything you need for Level 1 job match confidence
          </h2>
          <p className="text-sm text-slate-400">
            A battle-tested foundation providing clear, honest, explainable career insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Format Resume Parsing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts text from PDF, DOCX, and TXT files. Automatically identifies contact info,
              standard resume sections, experience duration, and categorized skill stacks.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Skill Gap & Matrix Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cross-references job requirements against your resume using a standardized skills taxonomy.
              Separates validated matches from missing must-have requirements.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ATS & Keyword Density</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates TF-IDF vector cosine similarity, action verb density, and quantifiable outcome
              metrics to ensure your resume passes corporate automated screenings.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Results Dashboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualize your match score through radial gauges, sub-score breakdowns, comparative keyword tables,
              and tailored action items.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Extensible AI Provider Interface</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with an abstract <code className="text-indigo-300">AIProviderInterface</code>. Level 1 runs
              honest, transparent deterministic algorithms; Level 2 can seamlessly plug in generative LLMs.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Auth & History Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              JWT token authentication with bcrypt password hashing. Store your past resumes, job descriptions,
              and analyses in PostgreSQL with seamless local dev resilience.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Simple 3-Step Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How OMEGA Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 relative">
            <span className="text-3xl font-extrabold text-indigo-500/40 font-mono">01</span>
            <h4 className="text-base font-bold text-white">Upload Your Resume</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop your PDF, DOCX, or TXT file into our secure parser. Review detected contact info and skills.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 relative">
            <span className="text-3xl font-extrabold text-indigo-500/40 font-mono">02</span>
            <h4 className="text-base font-bold text-white">Paste Target Role</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input the job title, company, and full job description. Or test with one of our pre-built role templates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 relative">
            <span className="text-3xl font-extrabold text-indigo-500/40 font-mono">03</span>
            <h4 className="text-base font-bold text-white">Review Detailed Insights</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get an overall match score, discover missing critical skills, and review action items to optimize your profile.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto">
            Ready to optimize your application before you hit submit?
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Join candidates using OMEGA to diagnose resume gaps and accelerate career breakthroughs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Create Your Account
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleDemoClick}>
              Explore Demo Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
