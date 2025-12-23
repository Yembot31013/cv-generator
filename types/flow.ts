export interface LinkedInProfile {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      city?: string;
      countryCode?: string;
    };
    profiles?: Array<{
      network?: string;
      username?: string;
      url?: string;
    }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
  }>;
  skills?: Array<{
    name?: string;
    level?: string;
    keywords?: string[];
  }>;
  volunteer?: Array<{
    organization?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    url?: string;
  }>;
  certificates?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language?: string;
    fluency?: string;
  }>;
}

export interface JobDescription {
  title?: string;
  company?: string;
  location?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  benefits?: string[];
  // Additional fields
  salary?: string; // e.g., "$4,500 - $5,500 USD/mo"
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string; // "monthly", "yearly", "hourly"
  };
  experienceRequired?: string; // e.g., "5+ years", "+6 yrs exp"
  employmentType?: string; // "full-time", "part-time", "contract", "freelance"
  workMode?: string; // "remote", "hybrid", "onsite"
  teamSize?: string;
  industry?: string;
  applicationDeadline?: string;
  contactInfo?: string;
  applicationMethod?: string; // e.g., "Send your CV"
}

export interface AIEnhancementRequest {
  linkedInData: LinkedInProfile;
  jobDescription: JobDescription;
}

export interface FlowStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export type FlowStepId = 'upload' | 'extract' | 'job-description' | 'ai-enhance' | 'select-template' | 'download';
