export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  links: string[];
}

export interface ParsedResumeData {
  contact: ContactInfo;
  skills: string[];
  categorized_skills: Record<string, string[]>;
  education: string[];
  experience: string[];
  word_count: number;
  detected_sections: string[];
}

export interface Resume {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  raw_text: string;
  parsed_data: ParsedResumeData | null;
  is_primary?: boolean | number;
  target_role?: string | null;
  version_tag?: string;
  created_at: string;
}


export interface JobDescription {
  id: number;
  title: string;
  company: string | null;
  experience_level: string | null;
  raw_text: string;
  parsed_skills: string[] | null;
  created_at: string;
}

export interface ScoreBreakdown {
  hard_skills: number;
  keyword_relevance: number;
  ats_readability: number;
  experience_alignment: number;
}

export interface SkillItem {
  name: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  frequency_in_jd: number;
  found_in_resume: boolean;
}

export interface KeywordFrequency {
  keyword: string;
  jd_count: number;
  resume_count: number;
  match_status: 'matched' | 'missing' | 'overused';
}

export interface RecommendationItem {
  id: string;
  type: 'skill_gap' | 'ats_format' | 'experience_bullet' | 'action_verb';
  title: string;
  description: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
}

export interface ResumeImprovement {
  section: string;
  issue: string;
  suggestion: string;
  example_rewrite: string;
}

export interface RecommendedSkill {
  skill: string;
  category: string;
  priority: string;
  reason: string;
}

export interface ApplicationGuidance {
  elevator_pitch?: string;
  cover_letter_hook?: string;
  strengths_to_highlight?: string[];
  talking_points_for_gaps?: string;
}

export interface AnalysisResponse {
  id: number;
  resume_id: number;
  job_id: number | null;
  job_title: string;
  company: string | null;
  overall_score: number;
  match_percentage?: number;
  scores_breakdown: ScoreBreakdown;
  matched_skills: SkillItem[];
  matching_skills?: SkillItem[];
  missing_skills: SkillItem[];
  bonus_skills: SkillItem[];
  keyword_analysis: {
    top_keywords: KeywordFrequency[];
    jd_total_keywords: number;
    resume_total_keywords: number;
  };
  recommendations: RecommendationItem[];
  resume_improvements?: ResumeImprovement[];
  recommended_skills?: RecommendedSkill[];
  interview_focus_areas?: string[];
  application_guidance?: ApplicationGuidance;
  job_recommendations?: string[];
  provider_name: string;
  created_at: string;
}

export interface AnalysisHistoryItem {
  id: number;
  job_title: string;
  company: string | null;
  overall_score: number;
  matched_skills_count: number;
  missing_skills_count: number;
  created_at: string;
}

// Level 2: Mock Interview Types
export interface CreateInterviewRequest {
  job_role: string;
  experience_level: string;
  interview_type: 'technical' | 'hr' | 'behavioral' | 'mixed';
  resume_id?: number;
  question_count: number;
}

export interface EvaluationAxis {
  score: number;
  feedback: string;
}

export interface AnswerEvaluation {
  relevance: EvaluationAxis;
  technical_correctness: EvaluationAxis;
  communication: EvaluationAxis;
  completeness: EvaluationAxis;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improved_answer: string;
}

export interface InterviewQuestionAnswer {
  id: number;
  question_text: string;
  question_type: string;
  category?: string;
  expected_criteria?: string[];
  user_answer?: string | null;
  evaluation?: AnswerEvaluation | null;
  score?: number | null;
}

export interface InterviewSession {
  id: number;
  job_role: string;
  experience_level: string;
  interview_type: string;
  overall_score?: number | null;
  summary_feedback?: string | null;
  questions: InterviewQuestionAnswer[];
  created_at: string;
}

export interface InterviewSessionSummary {
  id: number;
  job_role: string;
  experience_level: string;
  interview_type: string;
  overall_score?: number | null;
  questions_count: number;
  answered_count: number;
  created_at: string;
}

// Level 2: Learning Roadmap Types
export interface RoadmapResource {
  title: string;
  type: string;
  description?: string;
  url_or_query: string;
}

export interface RoadmapPhase {
  phase_number: number;
  title: string;
  duration: string;
  goal: string;
  skills_covered: string[];
  topics: string[];
  projects_to_build: string[];
  resources: RoadmapResource[];
  action_checklist: string[];
}

export interface RoadmapData {
  target_role: string;
  summary: string;
  estimated_weeks: number;
  phases: RoadmapPhase[];
}

export interface RoadmapResponse {
  id: number;
  target_role: string;
  skill_gaps: string[];
  roadmap_data: RoadmapData;
  analysis_id?: number | null;
  created_at: string;
}

export interface RoadmapSummary {
  id: number;
  target_role: string;
  skill_gaps: string[];
  created_at: string;
}

export interface RoadmapRequest {
  skill_gaps: string[];
  target_role: string;
  current_skills?: string[];
  analysis_id?: number;
  timeframe_weeks?: number;
}

export interface ApiError {
  detail: string;
  error_type?: string;
  message?: string;
}

// Level 3: Job Opportunities & Board
export interface JobOpportunity {
  id: number;
  user_id: number;
  title: string;
  company: string;
  location: string;
  workplace_type: string;
  salary_range?: string | null;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  job_description: string;
  url?: string | null;
  match_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobSearchResultItem {
  id: string;
  title: string;
  company: string;
  location: string;
  workplace_type: string;
  salary_range: string;
  experience_level: string;
  required_skills: string[];
  description_snippet: string;
  full_description: string;
  posted_date: string;
  apply_url?: string | null;
}

