// AI Review Types for Resume and Cover Letter Analysis

export type ScoreLevel = 'excellent' | 'good' | 'fair' | 'needs_work' | 'critical';

export interface ScoreBreakdown {
  score: number; // 0-100
  level: ScoreLevel;
  title: string;
  description: string;
  suggestions: string[];
  importance: 'high' | 'medium' | 'low';
  tooltip: string; // Explains what this metric means and why it matters
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  context?: string; // Where it was found or where it should be added
  importance: 'critical' | 'important' | 'nice_to_have';
}

export interface SectionReview {
  sectionName: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ResumeReview {
  overallScore: number;
  overallLevel: ScoreLevel;
  summary: string;
  
  // Category scores
  categories: {
    jobAlignment: ScoreBreakdown;
    impactStatements: ScoreBreakdown;
    skillsMatch: ScoreBreakdown;
    experienceRelevance: ScoreBreakdown;
    quantifiableResults: ScoreBreakdown;
    professionalFormatting: ScoreBreakdown;
    keywordOptimization: ScoreBreakdown;
    readability: ScoreBreakdown;
  };
  
  // Keyword analysis
  keywordAnalysis: {
    matchedKeywords: KeywordMatch[];
    missingKeywords: KeywordMatch[];
    matchRate: number; // Percentage
  };
  
  // Section-by-section breakdown
  sectionReviews: SectionReview[];
  
  // Quick highlights
  topStrengths: string[];
  criticalIssues: string[];
  quickWins: string[]; // Easy fixes that would improve the score
}

export interface CoverLetterReview {
  overallScore: number;
  overallLevel: ScoreLevel;
  summary: string;
  
  categories: {
    openingImpact: ScoreBreakdown;
    companyKnowledge: ScoreBreakdown;
    valueProposition: ScoreBreakdown;
    relevantExamples: ScoreBreakdown;
    enthusiasm: ScoreBreakdown;
    callToAction: ScoreBreakdown;
    tone: ScoreBreakdown;
    length: ScoreBreakdown;
  };
  
  topStrengths: string[];
  criticalIssues: string[];
  quickWins: string[];
}

export interface AIReviewResult {
  resumeReview: ResumeReview;
  coverLetterReview?: CoverLetterReview;
  compatibilityScore: number; // How well resume + cover letter work together
  
  // Meta info
  reviewedAt: string;
  jobTitle?: string;
  company?: string;
}

// Helper function to get score level
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'needs_work';
  return 'critical';
}

// Helper function to get color based on score level
export function getScoreColor(level: ScoreLevel): { bg: string; text: string; border: string; ring: string } {
  switch (level) {
    case 'excellent':
      return { 
        bg: 'bg-emerald-500/20', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/50',
        ring: 'stroke-emerald-500'
      };
    case 'good':
      return { 
        bg: 'bg-green-500/20', 
        text: 'text-green-400', 
        border: 'border-green-500/50',
        ring: 'stroke-green-500'
      };
    case 'fair':
      return { 
        bg: 'bg-yellow-500/20', 
        text: 'text-yellow-400', 
        border: 'border-yellow-500/50',
        ring: 'stroke-yellow-500'
      };
    case 'needs_work':
      return { 
        bg: 'bg-orange-500/20', 
        text: 'text-orange-400', 
        border: 'border-orange-500/50',
        ring: 'stroke-orange-500'
      };
    case 'critical':
      return { 
        bg: 'bg-red-500/20', 
        text: 'text-red-400', 
        border: 'border-red-500/50',
        ring: 'stroke-red-500'
      };
  }
}

// Light mode colors
export function getScoreColorLight(level: ScoreLevel): { bg: string; text: string; border: string; ring: string } {
  switch (level) {
    case 'excellent':
      return { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        border: 'border-emerald-300',
        ring: 'stroke-emerald-500'
      };
    case 'good':
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        border: 'border-green-300',
        ring: 'stroke-green-500'
      };
    case 'fair':
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        border: 'border-yellow-300',
        ring: 'stroke-yellow-500'
      };
    case 'needs_work':
      return { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        border: 'border-orange-300',
        ring: 'stroke-orange-500'
      };
    case 'critical':
      return { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        border: 'border-red-300',
        ring: 'stroke-red-500'
      };
  }
}

export function getLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'fair': return 'Fair';
    case 'needs_work': return 'Needs Work';
    case 'critical': return 'Critical';
  }
}

export function getLevelEmoji(level: ScoreLevel): string {
  switch (level) {
    case 'excellent': return '🌟';
    case 'good': return '✅';
    case 'fair': return '⚠️';
    case 'needs_work': return '🔶';
    case 'critical': return '🚨';
  }
}

