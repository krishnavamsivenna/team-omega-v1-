import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  Target,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Mic,
  Compass,
  Briefcase,
  Layers,
  Star,
  Terminal,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [mockupTab, setMockupTab] = useState<'match' | 'interview' | 'roadmap'>('match');

  const handleDemoClick = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  const techCompanies = [
    { name: 'Google', role: 'Staff SRE' },
    { name: 'Stripe', role: 'Backend Eng' },
    { name: 'Meta', role: 'Full Stack' },
    { name: 'OpenAI', role: 'Platform Eng' },
    { name: 'Anthropic', role: 'Systems Eng' },
    { name: 'Datadog', role: 'Dist Systems' },
    { name: 'Apple', role: 'Cloud Arch' },
    { name: 'Vercel', role: 'DevEx Lead' },
  ];

  return (
    <div className="space-y-28 pb-24 overflow-hidden">
      {/* Top Ambient Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] todesktop-mesh pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Floating ToDesktop-Style Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full todesktop-badge text-xs font-semibold text-slate-300 dark:text-slate-200 transition-all hover:border-teal-500/40 group cursor-pointer shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">OMEGA 3.0 • AI Career Intelligence Platform</span>
          <span className="hidden sm:inline text-teal-400 font-mono text-[11px] bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
            HACKATHON FINAL
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Hero Headings */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white leading-[1.08]">
            Craft high-signal applications.{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Ace technical interviews.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Stop sending blind resumes into the ATS void. OMEGA diagnoses your resume against target roles,
            uncovers hidden skill gaps, and prepares you with real-time AI voice mock interviews.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Go to Workspace Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Start Free Analysis
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleDemoClick}
                icon={<Zap className="w-4 h-4 text-amber-400 fill-amber-400" />}
              >
                Instant Demo Access
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          ⚡ No credit card required • Instant evaluation • 100% Free & Open Source
        </p>

        {/* SIGNATURE TODESKTOP-STYLE MACOS APP WINDOW MOCKUP */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-teal-500/20 bg-white/95 dark:bg-[#111518] shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden text-left">
            {/* Window Header / Titlebar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#151b1f] flex items-center justify-between">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 inline-block shadow-xs"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 inline-block shadow-xs"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 inline-block shadow-xs"></span>
                <span className="hidden sm:inline-block ml-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  omega-agent://workspace/candidate-analysis — Senior Full-Stack Engineer
                </span>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI Connected
                </span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-white/[0.05] px-2 py-0.5 rounded">
                  v3.0.4
                </span>
              </div>
            </div>

            {/* Interactive Mockup Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#13171a] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setMockupTab('match')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  mockupTab === 'match'
                    ? 'border-teal-400 text-teal-600 dark:text-teal-300 bg-white dark:bg-[#181f24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-teal-400" />
                Compatibility & Gap Matrix
              </button>
              <button
                onClick={() => setMockupTab('interview')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  mockupTab === 'interview'
                    ? 'border-teal-400 text-teal-600 dark:text-teal-300 bg-white dark:bg-[#181f24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                AI Voice Mock Studio
              </button>
              <button
                onClick={() => setMockupTab('roadmap')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  mockupTab === 'roadmap'
                    ? 'border-teal-400 text-teal-600 dark:text-teal-300 bg-white dark:bg-[#181f24]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Personalized Roadmap
              </button>
            </div>

            {/* Mockup Tab Content */}
            <div className="p-5 sm:p-7 bg-white dark:bg-[#111518]">
              {mockupTab === 'match' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Radial Score & Stats */}
                  <div className="md:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.08] text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-400 mb-1">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        91<span className="text-2xl text-teal-400">%</span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                        High Fit • Strong Match
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06] text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Keyword Alignment</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">89%</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>ATS Readability</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">96 / 100</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Experience Level</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">4.5 yrs matched</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Skills Matrix & Gap Delta */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Matching Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validated Core Skills (8 Matched)
                        </span>
                        <span className="text-[11px] text-slate-400">Exact Taxonomy Fit</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['React 19', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Tailwind CSS'].map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skill Gaps */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Detected Skill Gaps (2 Items)
                        </span>
                        <span className="text-[11px] text-amber-500">Action Required</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Kubernetes (K8s)</p>
                            <p className="text-[11px] text-slate-500">Container orchestration</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            High Priority
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Apache Kafka</p>
                            <p className="text-[11px] text-slate-500">Event-driven streaming</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Medium Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation Quote */}
                    <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">AI Optimization Tip:</strong> Highlight your containerized microservices deployment in Project 2. Mentioning pod scaling will boost your match confidence past 95%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mockupTab === 'interview' && (
                <div className="space-y-4">
                  {/* Interview Question Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold">
                          <Terminal className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          AI Interviewer: Senior Distributed Systems Architect
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        Question 2 of 5
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      &ldquo;How would you prevent cascading failures in a microservices architecture when an upstream PostgreSQL database experiences high connection contention?&rdquo;
                    </p>
                  </div>

                  {/* Candidate Audio / Waveform Simulator */}
                  <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/30">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Live Voice Answer Recorded</p>
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">00:48 / 02:00 • 142 words parsed</p>
                      </div>
                    </div>

                    {/* Animated Waveform Bars */}
                    <div className="flex items-center gap-1 h-6">
                      <span className="w-1 bg-teal-400 rounded-full animate-wave-1"></span>
                      <span className="w-1 bg-emerald-400 rounded-full animate-wave-2"></span>
                      <span className="w-1 bg-teal-500 rounded-full animate-wave-3"></span>
                      <span className="w-1 bg-teal-300 rounded-full animate-wave-4"></span>
                      <span className="w-1 bg-emerald-300 rounded-full animate-wave-5"></span>
                      <span className="w-1 bg-teal-400 rounded-full animate-wave-2"></span>
                      <span className="w-1 bg-teal-500 rounded-full animate-wave-1"></span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Evaluation Score: 94/100
                      </span>
                    </div>
                  </div>

                  {/* 4-Axis Metric Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.06] text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Communication</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">96%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.06] text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Tech Accuracy</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">93%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.06] text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Relevance</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">95%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.06] text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Completeness</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">91%</p>
                    </div>
                  </div>
                </div>
              )}

              {mockupTab === 'roadmap' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        4-Week Target Role Mastery Path
                      </h4>
                      <p className="text-xs text-slate-500">Milestones automatically synthesized from detected skill gaps</p>
                    </div>
                    <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                      Overall Progress: 62%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Phase 01 • Finished</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Docker & Microservices Architecture</p>
                      <p className="text-[11px] text-slate-500">Container lifecycle & multi-stage builds</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2 ring-1 ring-teal-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-400 uppercase">Phase 02 • Active</span>
                        <span className="text-[11px] font-bold text-teal-400">Week 2</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Kubernetes Pods, Services & Ingress</p>
                      <p className="text-[11px] text-slate-500">Deploying cluster workloads to Minikube</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151b1f] border border-slate-200 dark:border-white/[0.06] space-y-2 opacity-75">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Phase 03 • Next</span>
                        <span className="text-[11px] text-slate-500">Week 3</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Event-Driven Architecture with Kafka</p>
                      <p className="text-[11px] text-slate-500">Producer/Consumer streams & partitions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Tech Ticker Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Engineered for candidates interviewing across top engineering organizations
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {techCompanies.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#13171a] border border-slate-200 dark:border-white/[0.08] hover:border-teal-500/40 transition-all shadow-xs group"
            >
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors">
                {c.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-mono">
                {c.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3-STEP BENTO GRID ("HOW OMEGA WORKS") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-500 dark:text-teal-400">
            Intelligent Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How OMEGA Works in 3 Steps
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From raw PDF to high-confidence interview delivery in under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Bento Card */}
          <Card hoverEffect className="space-y-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold font-mono text-teal-600/30 dark:text-teal-400/30 group-hover:text-teal-400 transition-colors">
                01
              </span>
              <span className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 dark:text-teal-400">
                <FileText className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-Format Parsing & Ingestion
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drop your PDF, DOCX, or TXT resume into our secure engine. The parser extracts experience timelines,
                categorized tech stacks, accomplishments, and contact info in milliseconds.
              </p>
            </div>

            {/* Micro visual snippet */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>parser_status</span>
                <span className="text-emerald-500 font-bold">200 OK</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300">
                skills: [&apos;Python&apos;, &apos;FastAPI&apos;, &apos;React&apos;...]
              </p>
            </div>
          </Card>

          {/* Step 2 Bento Card */}
          <Card hoverEffect className="space-y-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold font-mono text-emerald-600/30 dark:text-emerald-400/30 group-hover:text-emerald-400 transition-colors">
                02
              </span>
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Target className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Compatibility & Gap Matrix
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cross-references the role requirements against your profile using deterministic NLP and vector similarity.
                Pinpoints missing high-priority skills, action verbs, and ATS keyword density.
              </p>
            </div>

            {/* Micro visual snippet */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>vector_cosine_fit</span>
                <span className="text-teal-400 font-bold">0.912</span>
              </div>
              <p className="text-[11px] text-amber-500">missing: [&apos;Kubernetes&apos;, &apos;Kafka&apos;]</p>
            </div>
          </Card>

          {/* Step 3 Bento Card */}
          <Card hoverEffect className="space-y-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold font-mono text-teal-600/30 dark:text-teal-400/30 group-hover:text-teal-400 transition-colors">
                03
              </span>
              <span className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 dark:text-teal-400">
                <Mic className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Speech-Enabled AI Mock Interview
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice answering dynamic technical and behavioral interview questions generated specifically for your role.
                Speak into your mic or type; receive instant 4-axis scoring with actionable improvements.
              </p>
            </div>

            {/* Micro visual snippet */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>voice_eval_rating</span>
                <span className="text-emerald-500 font-bold">94 / 100</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300">rubric: [comm, tech, rel, comp]</p>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURE BENTO MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-500 dark:text-teal-400">
            Engineered Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The Complete Career Readiness Suite
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A comprehensive ecosystem designed to take you from applicant to hired.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card A: Wide 8-Column Job Board & Web Scraper */}
          <Card hoverEffect className="md:col-span-8 space-y-5 p-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Live Jobs Board & 1-Click Fit Matcher
                </h3>
                <p className="text-xs text-slate-500">Real-time discoverability with instant candidate compatibility</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore curated live openings across Software Engineering, Cloud Architecture, and AI/ML. Filter by Remote,
              Hybrid, or Onsite status, and run 1-click compatibility analysis straight against your active resume version.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-400 font-medium">Pipeline Stages</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Saved → Offer</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-400 font-medium">Instant Pre-fill</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">1-Click JDs</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-400 font-medium">Auto-Rank</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Match % Sorted</p>
              </div>
            </div>
          </Card>

          {/* Card B: 4-Column Resume Versioning */}
          <Card hoverEffect className="md:col-span-4 space-y-4 p-7">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resume Version Control</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Maintain tailored versions for different roles (Backend vs Full-Stack vs AI). Set your primary resume and track
              match improvement trajectories across versions.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <TrendingUp className="w-3.5 h-3.5" />
                Historical Trajectory Analytics
              </span>
            </div>
          </Card>

          {/* Card C: 4-Column Pluggable AI Engine */}
          <Card hoverEffect className="md:col-span-4 space-y-4 p-7">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dual AI Architecture</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pluggable provider architecture: toggle effortlessly between Cloud LLMs (OpenAI, Gemini, Anthropic) or 100%
              private local inference with Ollama.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero External Data Leakage
              </span>
            </div>
          </Card>

          {/* Card D: Wide 8-Column Learning Roadmaps */}
          <Card hoverEffect className="md:col-span-8 space-y-5 p-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personalized Learning Roadmaps
                </h3>
                <p className="text-xs text-slate-500">Autonomous step-by-step curriculum generation</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Don&apos;t just discover what skills you are missing — conquer them. OMEGA synthesizes a structured, phased
              curriculum complete with hands-on capstone projects and estimated completion hours.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                📅 4-Week Structured Phases
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                🛠️ Hands-On Capstone Prompts
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]">
                📥 Markdown Exportable
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* METRICS & SOCIAL PROOF GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl todesktop-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              94<span className="text-teal-400">%</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">ATS Screening Pass Rate</p>
          </div>
          <div className="p-6 rounded-2xl todesktop-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              &lt; 2.4<span className="text-teal-400">s</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Multi-Format Parse & Match</p>
          </div>
          <div className="p-6 rounded-2xl todesktop-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              15,000<span className="text-teal-400">+</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Tech Skills Taxonomy Mappings</p>
          </div>
          <div className="p-6 rounded-2xl todesktop-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              100<span className="text-teal-400">%</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Privacy-First Local AI Mode</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card hoverEffect className="space-y-4 p-6">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;OMEGA caught three critical keyword discrepancies between my resume and a Staff SRE listing at Datadog. Made the tweaks, got the recruiter screen 48 hours later.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                AK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Alex K.</p>
                <p className="text-[10px] text-slate-500">Staff Infrastructure Engineer</p>
              </div>
            </div>
          </Card>

          <Card hoverEffect className="space-y-4 p-6">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;The voice mock interview gave me the exact distributed system questions I was asked in my real Stripe technical round. The real-time rubric feedback is unmatched.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                ML
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Maya L.</p>
                <p className="text-[10px] text-slate-500">Senior Backend Engineer</p>
              </div>
            </div>
          </Card>

          <Card hoverEffect className="space-y-4 p-6">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;The learning roadmap mapped out my transition from Node.js to Go and Kubernetes with weekly deliverables. Landed an offer with a 40% comp jump.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                DR
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">David R.</p>
                <p className="text-[10px] text-slate-500">Platform Engineer</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FINAL HIGH-CONVERSION BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-teal-950/40 via-[#13171a] to-[#0d1114] border border-teal-500/30 p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden todesktop-mesh">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for your next career breakthrough?</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Stop guessing what recruiters want. Let AI show you.
          </h3>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Join forward-thinking engineers who use OMEGA to diagnose match gaps, practice live voice interviews,
            and submit with total confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Create Free Account
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={handleDemoClick} icon={<Zap className="w-4 h-4 text-amber-400" />}>
              Launch Demo Workspace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

