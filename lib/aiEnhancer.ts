import { GoogleGenAI } from '@google/genai';
import { CVData, CoverLetter } from '@/types/cv';
import { JobDescription } from '@/types/flow';

/**
 * AI-powered CV enhancement using Google Gemini
 */
export class AIEnhancer {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
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
   * Enhance CV data based on job description
   * The AI acts as a psychological expert, making intelligent assumptions
   * and filling in details to create a compelling, tailored CV
   * Optionally accepts files for better accuracy
   */
  async enhanceCV(
    partialCV: Partial<CVData>,
    jobDescription: JobDescription,
    files?: File[]
  ): Promise<CVData> {
    const prompt = this.buildEnhancementPrompt(partialCV, jobDescription);

    try {
      // Build content array with prompt and optionally files
      const contents: any[] = [{ text: prompt }];

      // Add files if provided for better accuracy
      if (files && files.length > 0) {
        for (const file of files) {
          const fileData = await this.fileToBase64(file);
          contents.push({
            inlineData: {
              mimeType: file.type,
              data: fileData
            }
          });
        }
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
      });

      const text = response.text || "";

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const enhancedData = JSON.parse(jsonMatch[0]);
      return this.validateAndComplete(enhancedData);
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      throw new Error('Failed to enhance CV with AI. Please try again.');
    }
  }

  /**
   * Build the enhancement prompt for Gemini
   */
  private buildEnhancementPrompt(partialCV: Partial<CVData>, job: JobDescription): string {
    return `You are an expert CV writer and career psychologist with 20+ years of experience. Your task is to transform a basic CV into a compelling, tailored resume that perfectly matches a specific job description.

**Job Details:**
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}
Location: ${job.location || 'Not specified'}

**Job Description:**
${job.description}

**Key Requirements:**
${job.requirements?.join('\n') || 'Not specified'}

**Key Responsibilities:**
${job.responsibilities?.join('\n') || 'Not specified'}

**Required Skills:**
${job.skills?.join(', ') || 'Not specified'}

**Current CV Data:**
${JSON.stringify(partialCV, null, 2)}

**IMPORTANT: SOURCE FILES PROVIDED**
The user has uploaded files (resumes, portfolios, documents) that contain their REAL information. You MUST:
1. **THOROUGHLY SEARCH** all provided files for URLs, links, contact info, project details and all
2. **EXTRACT REAL DATA** - Look for GitHub profiles, LinkedIn URLs, portfolio links, project URLs
3. **DO NOT FABRICATE** - If you cannot find a URL or link in the provided files, use EMPTY STRING ""
4. **VERIFY ACCURACY** - Only use URLs/links that you can actually find in the provided documents

**Your Mission:**
Transform this CV into a stunning, tailored resume that:

1. **Psychological Impact**: Position the candidate as THE expert for this role
2. **Strategic Enhancement**:
   - Rewrite job descriptions to highlight achievements matching the job requirements
   - Add quantifiable metrics (use realistic assumptions: team sizes, percentages, numbers)
   - Emphasize relevant technologies and skills mentioned in the job description
   - Create compelling project highlights that demonstrate required competencies

3. **Intelligent Assumptions (EXCEPT for URLs/Links)**:
   - For TEXT content: make educated guesses based on job title, industry standards, experience
   - Fill in reasonable details (team sizes, budget ranges, user numbers, performance metrics)
   - Add industry-standard technologies if not specified
   - **NEVER ASSUME OR FABRICATE URLs, LINKS, OR CONTACT URLS**

4. **Professional Touch**:
   - Create a powerful bio that positions them as the ideal candidate
   - Ensure ALL experience descriptions have 3-4 bullet points with metrics
   - Add relevant technical skills matching the job requirements
   - Create impressive project highlights with realistic metrics
   - If certifications are sparse, suggest relevant ones they likely have

5. **Completeness**:
   - Ensure NO empty arrays or missing required fields
   - Every experience must have: company, position, dates, 3-4 descriptions, technologies
   - Every project must have: name, description, technologies, 2-3 highlights
   - Skills must be categorized and comprehensive

**CRITICAL URL RULES - ABSOLUTELY MANDATORY:**
⚠️ For website, linkedin, github, twitter, project links:
- ONLY use URLs that you can ACTUALLY FIND in the provided files/documents
- If a URL is not found in the source files, use EMPTY STRING ""
- NEVER generate fake URLs like "https://github.com/username" or "https://linkedin.com/in/name"
- NEVER create placeholder URLs like "N/A", "Private Repository", "Coming Soon"
- NEVER guess or assume URLs based on the person's name
- It is BETTER to have an empty field than a fake/fabricated URL
- If you see a project is "private" or has no URL, leave the link field as ""

**🧠 CONTEXT-AWARE URL INTELLIGENCE:**
You must understand the RELATIONSHIP between URLs and the person's role:

**COMPANY URL vs PERSONAL WEBSITE:**
- If person is an EMPLOYEE (Developer, Manager, Engineer, etc.) at a company:
  → The company's website is NOT their personal website
  → like for example, Don't put "donclemtech.com" as personal website if they just WORK there
  
- If person is a FOUNDER/OWNER/CEO of a company:
  → The company's website CAN be their personal representation
  → It's valid to use the company URL as their website

**HOW TO DETECT OWNERSHIP:**
- Look at job titles in the experience/work history
- "Founder", "CEO", "Co-founder", "Owner", "Principal" = They OWN it
- "Developer", "Engineer", "Manager", "Designer", etc. = They're an EMPLOYEE

**EXAMPLE:**
If you see in the source files:
- URL: "https://www.donclemtech.com"
- Experience: "Senior Developer at Don-Clem Technology"
→ This person WORKS at the company. The URL should NOT go in their personal website field.

But if you see:
- URL: "https://www.donclemtech.com"
- Experience: "Founder & CEO at Don-Clem Technology"
→ They OWN the company. The URL CAN go in their personal website field.

**Examples of FORBIDDEN fake URLs (DO NOT DO THIS):**
- https://github.com/johndoe ❌ (guessed from name)
- https://linkedin.com/in/john-doe ❌ (guessed from name)
- https://portfolio.example.com ❌ (placeholder)
- Private Repository ❌ (not a URL)
- N/A ❌ (not a URL)
- https://company-name.github.io ❌ (guessed from company)
- Employer's website as personal website ❌ (if they're just an employee)

**Correct approach:**
- If found in file AND it's their personal/portfolio URL: use it ✓
- If found but it's their employer's URL (and they're not the owner): "" ✓
- If NOT found: "" ✓ (empty string)

**CRITICAL RULES:**
- Make it feel authentic and believable
- Use confident, achievement-focused language
- Add specific numbers and metrics (be realistic but impressive)
- Tailor everything to match the job description keywords
- Be psychologically persuasive - make them sound like THE expert
- Fill in gaps intelligently - no empty fields or "TBD" (EXCEPT URLs - leave those empty if not found)

**Output Format:**
Return ONLY a valid JSON object matching this exact structure:

{
  "personalInfo": {
    "fullName": "string",
    "title": "string (tailor to job title)",
    "email": "string (ONLY from source files)",
    "phone": "string (ONLY from source files)",
    "location": "string",
    "website": "string (ONLY real URL from source files, or empty string)",
    "linkedin": "string (ONLY real URL from source files, or empty string)",
    "github": "string (ONLY real URL from source files, or empty string)",
    "twitter": "string (ONLY real URL from source files, or empty string)",
    "bio": "string (3-4 sentences positioning them as ideal for this role)"
  },
  "experience": [
    {
      "id": "string",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": ["achievement 1 with metrics", "achievement 2 with metrics", "achievement 3 with metrics"],
      "technologies": ["tech1", "tech2", "tech3"]
    }
  ],
  "education": [...],
  "skills": [
    {
      "category": "Frontend/Backend/etc",
      "items": ["skill1", "skill2"],
      "level": "Expert/Advanced/Intermediate"
    }
  ],
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "technologies": ["tech1", "tech2"],
      "link": "string (ONLY real URL from source files, or empty string)",
      "github": "string (ONLY real URL from source files, or empty string)",
      "highlights": ["highlight with metrics", "highlight with metrics"]
    }
  ],
  "certifications": [...],
  "languages": [{"name": "string", "proficiency": "string"}]
}

**FINAL CHECK BEFORE RESPONDING:**
Before outputting JSON, verify:
□ Every URL field contains ONLY a real URL found in source files, or is ""
□ No fabricated GitHub/LinkedIn/website URLs based on guessing
□ No placeholder text like "N/A", "Private", "Coming Soon" in URL fields
□ Project links are REAL URLs or empty strings

Make it IMPRESSIVE. Make it BELIEVABLE. Make it TAILORED. Make them look like THE perfect candidate.
But NEVER fabricate URLs - accuracy is more important than completeness for links.`;
  }

  /**
   * Validate and complete the enhanced data
   */
  private validateAndComplete(data: any): CVData {
    // Ensure all required fields exist with defaults
    const completed: CVData = {
      personalInfo: {
        fullName: data.personalInfo?.fullName || 'John Doe',
        title: data.personalInfo?.title || 'Professional',
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
            id: exp.id || `exp-${idx}`,
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
            id: edu.id || `edu-${idx}`,
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
      skills: Array.isArray(data.skills)
        ? data.skills
        : [{ category: 'Skills', items: [] }],
      projects: Array.isArray(data.projects)
        ? data.projects.map((proj: any, idx: number) => ({
            id: proj.id || `proj-${idx}`,
            name: proj.name || '',
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            link: proj.link || '',
            github: proj.github || '',
            highlights: Array.isArray(proj.highlights) ? proj.highlights : [],
          }))
        : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications
        : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
    };

    return completed;
  }

  /**
   * Quick enhancement without job description (just cleanup and formatting)
   */
  async quickEnhance(partialCV: Partial<CVData>, files?: File[]): Promise<CVData> {
    const prompt = `You are an expert CV formatter. Clean up and complete this CV data, adding reasonable details where needed. Make it professional and complete. Add metrics and details based on common industry standards.

Current CV Data:
${JSON.stringify(partialCV, null, 2)}

**IMPORTANT: SOURCE FILES PROVIDED**
The user has uploaded files containing their REAL information. You MUST:
1. SEARCH all provided files for URLs, links, contact info, project details
2. ONLY use URLs that you can ACTUALLY FIND in the provided documents
3. If you cannot find a URL/link in the files, use EMPTY STRING ""
4. NEVER fabricate or guess URLs based on names or companies

**CRITICAL URL RULES:**
- website, linkedin, github, twitter, project links: ONLY use real URLs from source files
- If not found → use "" (empty string)
- NEVER guess URLs like "https://github.com/username" based on the person's name
- NEVER use placeholders like "N/A", "Private Repository", "Coming Soon"
- It is BETTER to have an empty URL field than a fake one

Return ONLY a valid JSON object with complete CV data following standard CV structure. Fill in missing text details intelligently, but NEVER fabricate URLs.`;

    try {
      const contents: any[] = [{ text: prompt }];

      // Add files if provided
      if (files && files.length > 0) {
        for (const file of files) {
          const fileData = await this.fileToBase64(file);
          contents.push({
            inlineData: {
              mimeType: file.type,
              data: fileData
            }
          });
        }
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
      });

      const text = response.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const enhancedData = JSON.parse(jsonMatch[0]);
      return this.validateAndComplete(enhancedData);
    } catch (error) {
      console.error('Quick Enhancement Error:', error);
      throw new Error('Failed to enhance CV. Please try again.');
    }
  }

  /**
   * Generate a personalized cover letter based on CV data and job description
   * Optionally accepts files for better accuracy
   */
  async generateCoverLetter(
    cvData: CVData,
    jobDescription: JobDescription,
    files?: File[]
  ): Promise<CoverLetter> {
    const prompt = this.buildCoverLetterPrompt(cvData, jobDescription);

    try {
      const contents: any[] = [{ text: prompt }];

      // Add files if provided for better accuracy
      if (files && files.length > 0) {
        for (const file of files) {
          const fileData = await this.fileToBase64(file);
          contents.push({
            inlineData: {
              mimeType: file.type,
              data: fileData
            }
          });
        }
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
      });

      const text = response.text || "";

      // Try to extract structured JSON first
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.content) {
            return {
              content: parsed.content,
              salutation: parsed.salutation || 'Dear Hiring Manager,',
              closing: parsed.closing || 'Sincerely,',
            };
          }
        } catch (e) {
          // Fall through to text extraction
        }
      }

      // If no JSON, extract the letter content directly
      // Remove markdown code blocks if present
      let content = text.replace(/```[\s\S]*?```/g, '').trim();
      
      // Extract salutation if present
      const salutationMatch = content.match(/^(Dear\s+[^,\n]+(?:,|:))/i);
      const salutation = salutationMatch ? salutationMatch[1] : 'Dear Hiring Manager,';
      
      // Extract closing if present
      const closingMatch = content.match(/(Sincerely|Best regards|Regards|Yours sincerely|Yours truly)[,\s]*$/i);
      const closing = closingMatch ? closingMatch[1] + ',' : 'Sincerely,';

      return {
        content: content,
        salutation,
        closing,
      };
    } catch (error) {
      console.error('Cover Letter Generation Error:', error);
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }

  /**
   * Build the cover letter prompt for Gemini
   */
  private buildCoverLetterPrompt(cv: CVData, job: JobDescription): string {
    return `You are an expert cover letter writer with 20+ years of experience. Your task is to write a compelling, personalized cover letter that perfectly matches a specific job description.

**Job Details:**
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}
Location: ${job.location || 'Not specified'}

**Job Description:**
${job.description}

**Key Requirements:**
${job.requirements?.join('\n') || 'Not specified'}

**Key Responsibilities:**
${job.responsibilities?.join('\n') || 'Not specified'}

**Required Skills:**
${job.skills?.join(', ') || 'Not specified'}

**Candidate Information:**
Name: ${cv.personalInfo?.fullName || 'Not specified'}
Title: ${cv.personalInfo?.title || 'Not specified'}
Email: ${cv.personalInfo?.email || 'Not specified'}
Location: ${cv.personalInfo?.location || 'Not specified'}

**Professional Summary:**
${cv.personalInfo?.bio || 'Not specified'}

**Relevant Experience:**
${cv.experience?.slice(0, 3).map(exp => `
- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})
  ${exp.description?.slice(0, 2).join('\n  ')}
`).join('\n') || 'Not specified'}

**Key Skills:**
${cv.skills?.map(skill => `${skill.category}: ${skill.items?.slice(0, 5).join(', ')}`).join('\n') || 'Not specified'}

**Your Mission:**
Write a professional, compelling cover letter that:

1. **Opening Impact**: Start with a strong hook that immediately captures attention
2. **Personalization**: Reference specific aspects of the job description and company
3. **Value Proposition**: Clearly articulate why the candidate is perfect for this role
4. **Relevant Experience**: Highlight 2-3 most relevant experiences that match job requirements
5. **Skills Alignment**: Connect candidate's skills to job requirements naturally
6. **Enthusiasm**: Show genuine interest and passion for the role and company
7. **Professional Tone**: Maintain professional yet engaging tone throughout
8. **Closing**: End with a strong call to action

**CRITICAL RULES:**
- Keep it concise (3-4 paragraphs, ~300-400 words)
- Use confident, achievement-focused language
- Reference specific job requirements and how candidate meets them
- Include specific examples from candidate's experience
- Make it feel authentic and personalized
- Use proper business letter format
- Include appropriate salutation and closing

**Output Format:**
Return a JSON object with this structure:
{
  "salutation": "Dear [Hiring Manager/Name],",
  "content": "Full cover letter text with proper paragraphs",
  "closing": "Sincerely,"
}

OR if you prefer, return the cover letter as plain text with proper formatting. The content should be ready to use and professional.`;
  }
}

/**
 * Initialize AI Enhancer with API key
 */
export function createAIEnhancer(apiKey: string): AIEnhancer {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  return new AIEnhancer(apiKey);
}
