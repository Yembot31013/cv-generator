import { LinkedInProfile } from '@/types/flow';
import { CVData } from '@/types/cv';

/**
 * Extract CV data from LinkedIn JSON export
 */
export function extractFromLinkedInJSON(linkedInData: LinkedInProfile): Partial<CVData> {
  const basics = linkedInData.basics || {};
  const work = linkedInData.work || [];
  const education = linkedInData.education || [];
  const skills = linkedInData.skills || [];
  const projects = linkedInData.projects || [];
  const certificates = linkedInData.certificates || [];
  const languages = linkedInData.languages || [];

  return {
    personalInfo: {
      fullName: basics.name || '',
      title: basics.label || '',
      email: basics.email || '',
      phone: basics.phone || '',
      location: basics.location
        ? `${basics.location.city || ''}${basics.location.city && basics.location.countryCode ? ', ' : ''}${basics.location.countryCode || ''}`
        : '',
      website: basics.url || '',
      bio: basics.summary || '',
      linkedin: basics.profiles?.find(p => p.network?.toLowerCase() === 'linkedin')?.url || '',
      github: basics.profiles?.find(p => p.network?.toLowerCase() === 'github')?.url || '',
      twitter: basics.profiles?.find(p => p.network?.toLowerCase() === 'twitter')?.url || '',
    },
    experience: work.map((job, index) => ({
      id: `exp-${index}`,
      company: job.name || '',
      position: job.position || '',
      location: '',
      startDate: job.startDate || '',
      endDate: job.endDate || 'Present',
      description: job.highlights || job.summary ? [job.summary || '', ...(job.highlights || [])] : [],
      technologies: [],
    })),
    education: education.map((edu, index) => ({
      id: `edu-${index}`,
      institution: edu.institution || '',
      degree: edu.studyType || '',
      field: edu.area || '',
      location: '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.score || '',
      achievements: [],
    })),
    skills: skills.length > 0
      ? skills.map(skill => ({
          category: skill.name || 'General',
          items: skill.keywords || [],
          level: skill.level as any,
        }))
      : [{
          category: 'Skills',
          items: skills.map(s => s.name || '').filter(Boolean),
        }],
    projects: projects.map((project, index) => ({
      id: `proj-${index}`,
      name: project.name || '',
      description: project.description || '',
      technologies: [],
      link: project.url,
      highlights: project.highlights || [],
    })),
    certifications: certificates.map((cert, index) => ({
      id: `cert-${index}`,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
    })),
    languages: languages.map(lang => ({
      name: lang.language || '',
      proficiency: lang.fluency || '',
    })),
  };
}

/**
 * Parse LinkedIn resume from various formats
 */
export async function parseLinkedInResume(file: File): Promise<Partial<CVData>> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      // Parse JSON file
      const text = await file.text();
      const data = JSON.parse(text);
      return extractFromLinkedInJSON(data);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // For PDF, we'll need to extract text first
      // This will be handled by the AI to parse the content
      throw new Error('PDF parsing will be handled by AI enhancement');
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      // For DOCX, we'll need to extract text
      throw new Error('DOCX parsing will be handled by AI enhancement');
    } else {
      throw new Error('Unsupported file format. Please upload JSON, PDF, or DOCX file.');
    }
  } catch (error) {
    console.error('Error parsing LinkedIn resume:', error);
    throw error;
  }
}

/**
 * Extract text from PDF for AI processing
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // This will return raw text that AI can parse
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // For now, we'll just return a placeholder
        // In production, use pdf.js or similar
        resolve('PDF text content will be extracted here');
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate extracted CV data
 */
export function validateCVData(data: Partial<CVData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.personalInfo?.fullName) {
    errors.push('Full name is required');
  }

  if (!data.personalInfo?.email && !data.personalInfo?.phone) {
    errors.push('At least one contact method (email or phone) is required');
  }

  if (!data.experience || data.experience.length === 0) {
    errors.push('At least one work experience entry is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
