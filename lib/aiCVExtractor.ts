import { GoogleGenAI } from '@google/genai';
import { CVData } from '@/types/cv';

/**
 * AI-powered CV extraction using Google Gemini
 * Passes PDF/DOCX files directly to Gemini for intelligent extraction
 */
export class AICVExtractor {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Extract CV data from single or multiple files
   * Gemini analyzes all files together to build comprehensive profile
   */
  async extractFromFiles(files: File[]): Promise<Partial<CVData>> {
    try {
      // Build content array with prompt and all files
      const contents: any[] = [
        { text: this.buildExtractionPrompt(files.length) }
      ];

      // Add all files to the content array
      for (const file of files) {
        const fileData = await this.fileToBase64(file);
        contents.push({
          inlineData: {
            mimeType: file.type,
            data: fileData
          }
        });
      }

      // Use gemini-2.5-pro which automatically enables thinking mode
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            tools: [
        {urlContext: {}},
        {googleSearch: {}}
        ],
          }
      });

      const text = response.text || '';

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      return this.validateAndClean(extractedData);
    } catch (error) {
      console.error('AI CV Extraction Error:', error);
      throw new Error('Failed to extract CV data from files. Please try again.');
    }
  }

  /**
   * Build extraction prompt for Gemini
   */
  private buildExtractionPrompt(fileCount: number): string {
    const fileText = fileCount === 1 ? 'this document' : `these ${fileCount} documents`;

    return `You are an expert CV/resume parser with deep understanding of professional profiles. Analyze ${fileText} and extract ALL relevant information to build a comprehensive professional profile.

**Your Task:**
Extract and consolidate information from ${fileText} into a complete, structured CV profile. If multiple documents are provided, merge the information intelligently - combining unique experiences, skills, projects, and details from all sources.

**What to Extract:**

1. **Personal Information**:
   - Full name
   - Professional title/headline
   - Email, phone, location
   - Website, LinkedIn, GitHub, Twitter profiles
   - Professional bio/summary

2. **Work Experience**:
   - Company names
   - Job positions/titles
   - Locations
   - Start and end dates (format: YYYY-MM)
   - Detailed descriptions of achievements and responsibilities
   - Technologies and tools used
   - Extract specific metrics, numbers, team sizes, impact

3. **Education**:
   - Institution names
   - Degrees and fields of study
   - Locations
   - Dates (format: YYYY-MM)
   - GPA (if mentioned)
   - Academic achievements, honors, awards

4. **Skills**:
   - Categorize by type (Frontend, Backend, DevOps, Design, etc.)
   - List all technical skills, programming languages, frameworks, tools
   - Include proficiency levels if mentioned

5. **Projects**:
   - Project names
   - Descriptions
   - Technologies used
   - Links (live demo, GitHub)
   - Key highlights and achievements

6. **Certifications**:
   - Certification names
   - Issuing organizations
   - Dates obtained
   - Credential IDs and links

7. **Languages**:
   - Language names
   - Proficiency levels (Native, Fluent, Intermediate, Basic)

**CRITICAL RULES:**

- **Accuracy First**: Only extract information that is clearly stated in ${fileText}
- **Merge Intelligently**: If multiple documents provided, combine information without duplication
- **Preserve Details**: Keep specific metrics, dates, numbers, and technical details
- **Complete Descriptions**: For each experience, extract 3-4 detailed bullet points
- **Technology Lists**: Extract ALL mentioned technologies, frameworks, and tools
- **Dates Format**: Use YYYY-MM format for dates, use "Present" for current positions
- **Generate IDs**: Create unique IDs for each experience, education, project, certification (format: "exp-1", "edu-1", "proj-1", "cert-1")

**Output Format:**
Return ONLY a valid JSON object matching this EXACT structure:

{
  "personalInfo": {
    "fullName": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string",
    "twitter": "string",
    "bio": "string (professional summary/bio)"
  },
  "experience": [
    {
      "id": "exp-1",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": ["achievement 1", "achievement 2", "achievement 3"],
      "technologies": ["tech1", "tech2", "tech3"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "string",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "skills": [
    {
      "category": "Frontend",
      "items": ["skill1", "skill2"],
      "level": "Expert"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "string",
      "description": "string",
      "technologies": ["tech1", "tech2"],
      "link": "string",
      "github": "string",
      "highlights": ["highlight 1", "highlight 2"]
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM",
      "credentialId": "string",
      "link": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "Native/Fluent/Intermediate/Basic"
    }
  ]
}

**Important:**
- If a field is not found in ${fileText}, use empty string "" or empty array []
- Do NOT make up information
- Do NOT add information not present in ${fileText}
- Merge duplicate entries if multiple documents have same experiences
- Prioritize completeness - extract ALL available information

Analyze ${fileText} carefully and return the complete JSON structure.`;
  }

  /**
   * Convert file to base64 for Gemini API
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate and clean extracted data
   */
  private validateAndClean(data: any): Partial<CVData> {
    const cleaned: Partial<CVData> = {
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        title: data.personalInfo?.title || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        website: data.personalInfo?.website || '',
        linkedin: data.personalInfo?.linkedin || '',
        github: data.personalInfo?.github || '',
        twitter: data.personalInfo?.twitter || '',
        bio: data.personalInfo?.bio || '',
      },
      experience: Array.isArray(data.experience)
        ? data.experience.map((exp: any, idx: number) => ({
            id: exp.id || `exp-${idx + 1}`,
            company: exp.company || '',
            position: exp.position || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || 'Present',
            description: Array.isArray(exp.description) ? exp.description : [],
            technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
          }))
        : [],
      education: Array.isArray(data.education)
        ? data.education.map((edu: any, idx: number) => ({
            id: edu.id || `edu-${idx + 1}`,
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
            achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
          }))
        : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects)
        ? data.projects.map((proj: any, idx: number) => ({
            id: proj.id || `proj-${idx + 1}`,
            name: proj.name || '',
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            link: proj.link || '',
            github: proj.github || '',
            highlights: Array.isArray(proj.highlights) ? proj.highlights : [],
          }))
        : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications.map((cert: any, idx: number) => ({
            id: cert.id || `cert-${idx + 1}`,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            credentialId: cert.credentialId || '',
            link: cert.link || '',
          }))
        : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
    };

    return cleaned;
  }
}

/**
 * Create AI CV Extractor with API key
 */
export function createAICVExtractor(apiKey: string): AICVExtractor {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  return new AICVExtractor(apiKey);
}
