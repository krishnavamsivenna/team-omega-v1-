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

export interface AnalysisResponse {
  id: number;
  resume_id: number;
  job_id: number | null;
  job_title: string;
  company: string | null;
  overall_score: number;
  scores_breakdown: ScoreBreakdown;
  matched_skills: SkillItem[];
  missing_skills: SkillItem[];
  bonus_skills: SkillItem[];
  keyword_analysis: {
    top_keywords: KeywordFrequency[];
    jd_total_keywords: number;
    resume_total_keywords: number;
  };
  recommendations: RecommendationItem[];
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

export interface ApiError {
  detail: string;
  error_type?: string;
  message?: string;
}
