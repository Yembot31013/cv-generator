import { GoogleGenAI } from '@google/genai';
import { JobDescription } from '@/types/flow';

/**
 * AI-powered job description parser
 * Extracts structured data from recruiter messages or job postings
 */
export class JobDescriptionParser {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Parse recruiter message or job posting into structured format
   */
  async parseJobDescription(rawText: string): Promise<JobDescription> {
    const prompt = this.buildParsingPrompt(rawText);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });

      const text = response.text || "";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return this.validateAndClean(parsed, rawText);
    } catch (error) {
      console.error('Job Description Parsing Error:', error);
      // Fallback: return with just the raw description
      return {
        title: '',
        company: '',
        location: '',
        description: rawText,
        requirements: [],
        responsibilities: [],
        skills: [],
        benefits: [],
      };
    }
  }

  /**
   * Build the parsing prompt for Gemini
   */
  private buildParsingPrompt(rawText: string): string {
    return `You are an expert at analyzing job postings and recruiter messages. Extract ALL possible structured information from the following text, even if it's very short.

**Text to Analyze:**
${rawText}

**Your Task:**
Extract EVERYTHING you can find, including:

**Basic Information:**
1. Job Title (extract from any format: "Lead Backend Engineer", "Senior Developer", etc.)
2. Company Name (extract from any format: "Search Atlas", "TechCorp Inc", etc.)
3. Location (include "Remote" if mentioned, format: "City, Country" or "Remote")

**Compensation & Details:**
4. Salary (extract exactly as written: "$4,500 - $5,500 USD/mo", "€50k-70k", etc.)
5. Experience Required (extract: "+6 yrs exp", "5+ years", "3-5 years", etc.)
6. Employment Type ("full-time", "part-time", "contract", "freelance", etc.)
7. Work Mode ("remote", "hybrid", "onsite", "flexible")

**Content:**
8. Main Job Description (clean, complete description - if text is short, expand it intelligently)
9. Key Requirements (as array - extract from phrases like "Must have", "Required", etc.)
10. Key Responsibilities (as array - extract from phrases like "You'll be", "Responsible for", etc.)
11. Required Skills (as array - extract ALL technologies, tools, languages mentioned)
12. Benefits (as array - health insurance, PTO, etc.)

**Additional Details:**
13. Team Size (if mentioned: "team of 5", "leading team of 10", etc.)
14. Industry/Sector (if mentioned)
15. Application Method (extract: "Send your CV", "Apply via email", etc.)
16. Contact Info (email, phone, if mentioned)

**Critical Rules for Short Messages:**
- Even if text is VERY SHORT (like 50-200 characters), extract EVERYTHING possible
- For short messages, intelligently infer and expand the description based on title and skills
- Extract salary ranges even if abbreviated ("$4,500 - $5,500 USD/mo")
- Extract experience requirements even if abbreviated ("+6 yrs exp" → "6+ years experience")
- Extract skills from tech stack mentions ("Python/Django" → skills: ["Python", "Django"])
- If only title and tech stack are mentioned, create a reasonable description

**Examples:**

Input: "🚀 Search Atlas is hiring: Lead Backend Engineer (Python/Django)\n\nRole: Lead architecture & team (+6 yrs exp).\n\nTech: Django REST, mentoring.\n\nSalary: $4,500 - $5,500 USD/mo.\n\nReady to lead? Send your CV and join us!"

Output:
{
  "title": "Lead Backend Engineer",
  "company": "Search Atlas",
  "location": "",
  "description": "Lead Backend Engineer position at Search Atlas. Responsible for leading architecture and team. Requires 6+ years of experience. Tech stack includes Python, Django, and Django REST Framework. Role involves mentoring team members.",
  "requirements": ["6+ years of experience", "Lead architecture", "Team leadership"],
  "responsibilities": ["Lead architecture", "Lead team", "Mentor team members"],
  "skills": ["Python", "Django", "Django REST Framework", "Mentoring"],
  "benefits": [],
  "salary": "$4,500 - $5,500 USD/mo",
  "experienceRequired": "6+ years",
  "employmentType": "full-time",
  "workMode": "",
  "applicationMethod": "Send your CV"
}

**Output Format:**
Return ONLY a valid JSON object with this exact structure:

{
  "title": "string or empty",
  "company": "string or empty",
  "location": "string or empty (include 'Remote' if mentioned)",
  "description": "string (cleaned, complete job description - expand if short)",
  "requirements": ["requirement 1", "requirement 2", ...],
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "skills": ["skill 1", "skill 2", ...],
  "benefits": ["benefit 1", "benefit 2", ...],
  "salary": "string or empty (exact format as written)",
  "experienceRequired": "string or empty",
  "employmentType": "string or empty",
  "workMode": "string or empty",
  "teamSize": "string or empty",
  "industry": "string or empty",
  "applicationMethod": "string or empty"
}

**Important:**
- Extract EVERYTHING, even from very short messages
- Expand descriptions intelligently for short inputs
- Preserve exact salary format
- Extract all skills from tech stack mentions
- Include experience requirements in multiple formats
- Be thorough - extract every detail possible

Parse the text above and return the structured JSON.`;
  }

  /**
   * Validate and clean the parsed data
   */
  private validateAndClean(parsed: any, originalText: string): JobDescription {
    // Parse salary range if salary string contains range
    let salaryRange = undefined;
    if (parsed.salary) {
      const rangeMatch = parsed.salary.match(/(\d[\d,]+)\s*-\s*(\d[\d,]+)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
        const max = parseFloat(rangeMatch[2].replace(/,/g, ''));
        const currencyMatch = parsed.salary.match(/[$€£¥]|USD|EUR|GBP|JPY/);
        const periodMatch = parsed.salary.match(/\/(mo|month|yr|year|hr|hour)/i);
        salaryRange = {
          min,
          max,
          currency: currencyMatch ? currencyMatch[0] : undefined,
          period: periodMatch ? periodMatch[1].toLowerCase() : undefined,
        };
      }
    }

    return {
      title: parsed.title || '',
      company: parsed.company || '',
      location: parsed.location || '',
      description: parsed.description || originalText,
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      // Additional fields
      salary: parsed.salary || undefined,
      salaryRange: salaryRange,
      experienceRequired: parsed.experienceRequired || undefined,
      employmentType: parsed.employmentType || undefined,
      workMode: parsed.workMode || undefined,
      teamSize: parsed.teamSize || undefined,
      industry: parsed.industry || undefined,
      applicationMethod: parsed.applicationMethod || undefined,
    };
  }

  /**
   * Quick check if text looks like a job description/recruiter message
   * Updated to work with shorter messages
   */
  isLikelyJobDescription(text: string): boolean {
    const keywords = [
      'position',
      'role',
      'opportunity',
      'hiring',
      'looking for',
      'requirements',
      'responsibilities',
      'qualifications',
      'experience',
      'skills',
      'salary',
      'benefits',
      'remote',
      'location',
      'apply',
      'candidate',
      'job',
      'engineer',
      'developer',
      'lead',
      'senior',
      'yrs',
      'years',
      'exp',
      'usd',
      'eur',
      'send cv',
      'join us',
    ];

    const lowerText = text.toLowerCase();
    const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;

    // For short messages (less than 200 chars), lower threshold to 2 keywords
    // For longer messages, keep threshold at 3
    const threshold = text.length < 200 ? 2 : 3;
    return matchCount >= threshold;
  }
}

/**
 * Create parser instance with API key
 */
export function createJobDescriptionParser(apiKey: string): JobDescriptionParser {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  return new JobDescriptionParser(apiKey);
}
