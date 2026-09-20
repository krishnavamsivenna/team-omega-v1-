import React from 'react';
import { Briefcase, Sparkles } from 'lucide-react';

export interface SampleJob {
  title: string;
  company: string;
  experience_level: string;
  description: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stripe / Fintech Unicorn',
    experience_level: 'Senior (4-7 years)',
    description: `About the Role:
We are seeking a Senior Full Stack Engineer to architect and scale our core payment orchestration platform.

Key Responsibilities:
- Design, build, and maintain mission-critical APIs and services using Python (FastAPI/Django) and modern PostgreSQL.
- Build high-performance, accessible, and responsive user interfaces with React, TypeScript, and Tailwind CSS.
- Optimize database queries, indexing, and connection pools for low-latency transactions under high concurrent load.
- Deploy and monitor microservices using Docker, Kubernetes, and AWS (EC2, S3, RDS, CloudWatch).
- Collaborate in an Agile/Scrum team with product managers, designers, and site reliability engineers.

Required Qualifications:
- 4+ years of professional full stack software engineering experience.
- Strong proficiency in Python, TypeScript, React, and RESTful APIs.
- Solid understanding of relational databases (PostgreSQL/MySQL) and caching (Redis).
- Hands-on experience with containerization (Docker) and CI/CD pipelines (GitHub Actions).
- Excellent analytical problem-solving and cross-functional communication skills.`
  },
  {
    title: 'Lead Backend Engineer',
    company: 'Datadog / Cloud Scale',
    experience_level: 'Lead / Principal',
    description: `About the Role:
Looking for a Lead Backend Engineer to spearhead our distributed metrics ingestion pipeline.

Requirements:
- 6+ years designing large-scale distributed backend systems with Python, Go, or Java.
- Deep expertise in PostgreSQL, Kafka, Redis, and asynchronous messaging architectures.
- Experience with infrastructure as code using Terraform, Docker, and Kubernetes on AWS or GCP.
- Solid grasp of system design, performance profiling, unit testing, and microservices architecture.
- Demonstrated technical mentorship and engineering leadership.`
  },
  {
    title: 'AI / Machine Learning Engineer',
    company: 'Anthropic / AI Lab',
    experience_level: 'Mid-Senior (3-5 years)',
    description: `About the Role:
We are looking for an AI/ML Engineer to build LLM evaluation pipelines, fine-tuning infrastructure, and agent workflows.

Requirements:
- 3+ years in machine learning, NLP, and deep learning engineering.
- Fluent in Python, PyTorch, Hugging Face, Scikit-learn, and Pandas.
- Experience deploying ML models into production via FastAPI, Docker, and Kubernetes.
- Familiarity with Vector Databases, embeddings, and prompt engineering.
- B.S. or M.S. in Computer Science, Data Science, or related quantitative field.`
  }
];

interface SampleJobSelectorProps {
  onSelect: (job: SampleJob) => void;
}

export const SampleJobSelector: React.FC<SampleJobSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>Quick Test with Sample Roles:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SAMPLE_JOBS.map((job, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(job)}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-[#13171a] border border-white/[0.08] hover:border-teal-500/50 hover:bg-[#181f24] text-left transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 truncate">
                {job.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{job.company}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
