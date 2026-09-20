import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  User,
  Resume,
  AnalysisResponse,
  AnalysisHistoryItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('omega_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Extract clean error message
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ msg: string }> }>) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail.map((err) => err.msg).join(', ');
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  register: async (payload: { email: string; password: string; full_name?: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  loginDemo: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/demo');
    return data;
  },
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};

// Resume Endpoints
export const resumeAPI = {
  upload: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Resume>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  parseText: async (payload: { title: string; text: string }): Promise<Resume> => {
    const { data } = await apiClient.post<Resume>('/resumes/parse-text', payload);
    return data;
  },
  list: async (): Promise<Resume[]> => {
    const { data } = await apiClient.get<Resume[]>('/resumes/');
    return data;
  },
  getById: async (id: number): Promise<Resume> => {
    const { data } = await apiClient.get<Resume>(`/resumes/${id}`);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  },
};

// Analysis Endpoints
export const analysisAPI = {
  match: async (payload: {
    resume_id?: number;
    resume_text?: string;
    job_title: string;
    company?: string;
    experience_level?: string;
    job_description: string;
  }): Promise<AnalysisResponse> => {
    const { data } = await apiClient.post<AnalysisResponse>('/analysis/match', payload);
    return data;
  },
  getHistory: async (): Promise<AnalysisHistoryItem[]> => {
    const { data } = await apiClient.get<AnalysisHistoryItem[]>('/analysis/history');
    return data;
  },
  getReport: async (id: number): Promise<AnalysisResponse> => {
    const { data } = await apiClient.get<AnalysisResponse>(`/analysis/${id}`);
    return data;
  },
  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete(`/analysis/${id}`);
  },
};

// Health Endpoint
export const systemAPI = {
  getHealth: async () => {
    const { data } = await apiClient.get('/health');
    return data;
  },
};
