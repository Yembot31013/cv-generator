import { GoogleGenAI } from '@google/genai';
import { CVData, CoverLetter } from '@/types/cv';
import { JobDescription } from '@/types/flow';

/**
 * Result of a modification request
 */
export interface ModificationResult {
  success: boolean;
  type: 'resume' | 'coverLetter' | 'both' | 'invalid';
  message: string;
  modifiedResume?: CVData;
  modifiedCoverLetter?: CoverLetter;
  changes: string[]; // List of specific changes made
}

/**
 * AI-powered Resume and Cover Letter Modifier
 * Accepts natural language prompts to make specific changes
 */
export class AIModifier {
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
   * Modify resume and/or cover letter based on user prompt
   */
  async modify(
    prompt: string,
    currentResume: CVData,
    currentCoverLetter: CoverLetter | undefined,
    jobDescription: JobDescription,
    files?: File[]
  ): Promise<ModificationResult> {
    const systemPrompt = this.buildModificationPrompt(
      prompt,
      currentResume,
      currentCoverLetter,
      jobDescription
    );

    try {
      // Build content array
      const contents: any[] = [{ text: systemPrompt }];

      // Add files if provided for context
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
        config: {
            tools: [
        {urlContext: {}},
        {googleSearch: {}}
        ],
          }
      });

      const text = response.text || "";

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return this.validateAndCompleteResult(result, currentResume, currentCoverLetter);
    } catch (error) {
      console.error('AI Modification Error:', error);
      throw new Error('Failed to modify. Please try again.');
    }
  }

  /**
   * Build the modification prompt
   */
  private buildModificationPrompt(
    userPrompt: string,
    resume: CVData,
    coverLetter: CoverLetter | undefined,
    job: JobDescription
  ): string {
    return `You are an expert AI assistant that modifies resumes and cover letters based on user requests. You make PRECISE, TARGETED changes based on what the user asks for.

**USER'S MODIFICATION REQUEST:**
"${userPrompt}"

**CURRENT RESUME DATA:**
${JSON.stringify(resume, null, 2)}

${coverLetter ? `**CURRENT COVER LETTER:**
${JSON.stringify(coverLetter, null, 2)}` : '**COVER LETTER:** Not provided'}

**JOB CONTEXT:**
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}

---

**YOUR TASK:**

1. **ANALYZE THE REQUEST:** Determine what the user wants to change.

2. **VALIDATE THE REQUEST:** Is this a valid modification request?

**VALID REQUESTS (DO THESE):**
- "Change my website URL to https://example.com"
- "Update my email to john@gmail.com"
- "Add Python to my skills"
- "Remove the first job from experience"
- "Rewrite my bio to focus on leadership"
- "Change my title to Senior Developer"
- "Update my phone number to +1234567890"
- "Add a new project called X with description Y"
- "Make the cover letter more enthusiastic"
- "Shorten the cover letter"
- "Fix typos" (if you can identify any)

**INVALID REQUESTS (REJECT THESE):**
- "How good is my resume?" → Tell them to use the AI Reviewer
- "What should I improve?" → Tell them to use the AI Reviewer
- "Is my resume good enough?" → Tell them to use the AI Reviewer
- Vague questions without specific changes
- Requests for general feedback or evaluation
- Conversational messages ("Hi", "Thanks", etc.)

3. **MAKE THE CHANGES:** If valid, apply the exact changes requested.

4. **PRESERVE EVERYTHING ELSE:** Only modify what was requested. Keep all other data intact.

**RESPONSE FORMAT:**

If the request is VALID and you can make changes:
\`\`\`json
{
  "success": true,
  "type": "resume" | "coverLetter" | "both",
  "message": "Brief confirmation of what was changed",
  "changes": ["Specific change 1", "Specific change 2"],
  "modifiedResume": { /* FULL resume object with changes applied, or null if not modified */ },
  "modifiedCoverLetter": { /* FULL cover letter object with changes applied, or null if not modified */ }
}
\`\`\`

If the request is INVALID (question, vague, or not a modification):
\`\`\`json
{
  "success": false,
  "type": "invalid",
  "message": "Clear explanation of why this isn't a valid modification request and what they should do instead",
  "changes": []
}
\`\`\`

**CRITICAL RULES:**

1. **BE PRECISE:** Only change what was asked. Don't make unsolicited changes.
2. **PRESERVE DATA:** Return the COMPLETE resume/coverLetter objects, not just the changed parts.
3. **CONTEXT-AWARE URLs:**
   - If user provides a URL, use it exactly as given
   - If user asks to "update website" but doesn't provide URL, ask them to specify
   - Never fabricate URLs
4. **NO CONVERSATION:** This is not a chat. Accept modifications or reject with clear guidance.
5. **CLEAR FEEDBACK:** Tell the user exactly what you changed in the "changes" array.

**EXAMPLES:**

User: "Change my email to test@gmail.com"
→ Valid. Update personalInfo.email to "test@gmail.com"

User: "Is my resume good?"
→ Invalid. Return: { success: false, type: "invalid", message: "For resume evaluation and feedback, please use the AI Review feature. This modifier only accepts specific change requests like 'Change my email to X' or 'Add Y skill'.", changes: [] }

User: "Add React and TypeScript to my skills"
→ Valid. Add React and TypeScript to the appropriate skills category.

User: "Make my bio longer"
→ Valid. Expand the bio while maintaining the same message.

User: "hello"
→ Invalid. Return: { success: false, type: "invalid", message: "Please provide a specific modification request, such as 'Update my phone number to X' or 'Add Y to my experience'.", changes: [] }

Now analyze the user's request and respond with the appropriate JSON.`;
  }

  /**
   * Validate and complete the modification result
   */
  private validateAndCompleteResult(
    data: any,
    originalResume: CVData,
    originalCoverLetter: CoverLetter | undefined
  ): ModificationResult {
    // If invalid request
    if (!data.success || data.type === 'invalid') {
      return {
        success: false,
        type: 'invalid',
        message: data.message || 'Could not process this request. Please provide a specific modification.',
        changes: [],
      };
    }

    // Validate and complete resume if modified
    let modifiedResume: CVData | undefined;
    if (data.modifiedResume) {
      modifiedResume = this.validateResume(data.modifiedResume, originalResume);
    }

    // Validate and complete cover letter if modified
    let modifiedCoverLetter: CoverLetter | undefined;
    if (data.modifiedCoverLetter) {
      modifiedCoverLetter = this.validateCoverLetter(data.modifiedCoverLetter, originalCoverLetter);
    }

    return {
      success: true,
      type: data.type || 'resume',
      message: data.message || 'Changes applied successfully.',
      modifiedResume,
      modifiedCoverLetter,
      changes: Array.isArray(data.changes) ? data.changes : [],
    };
  }

  /**
   * Validate and complete resume data
   */
  private validateResume(data: any, original: CVData): CVData {
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName ?? original.personalInfo.fullName,
        title: data.personalInfo?.title ?? original.personalInfo.title,
        email: data.personalInfo?.email ?? original.personalInfo.email,
        phone: data.personalInfo?.phone ?? original.personalInfo.phone,
        location: data.personalInfo?.location ?? original.personalInfo.location,
        website: data.personalInfo?.website ?? original.personalInfo.website,
        linkedin: data.personalInfo?.linkedin ?? original.personalInfo.linkedin,
        github: data.personalInfo?.github ?? original.personalInfo.github,
        twitter: data.personalInfo?.twitter ?? original.personalInfo.twitter,
        bio: data.personalInfo?.bio ?? original.personalInfo.bio,
      },
      experience: Array.isArray(data.experience) ? data.experience : original.experience,
      education: Array.isArray(data.education) ? data.education : original.education,
      skills: Array.isArray(data.skills) ? data.skills : original.skills,
      projects: Array.isArray(data.projects) ? data.projects : original.projects,
      certifications: Array.isArray(data.certifications) ? data.certifications : original.certifications,
      languages: Array.isArray(data.languages) ? data.languages : original.languages,
    };
  }

  /**
   * Validate and complete cover letter data
   */
  private validateCoverLetter(data: any, original: CoverLetter | undefined): CoverLetter {
    const defaultCoverLetter: CoverLetter = {
      content: '',
      salutation: 'Dear Hiring Manager,',
      closing: 'Sincerely,',
    };

    const base = original || defaultCoverLetter;

    return {
      content: data.content ?? base.content,
      salutation: data.salutation ?? base.salutation,
      closing: data.closing ?? base.closing,
    };
  }
}

/**
 * Initialize AI Modifier with API key
 */
export function createAIModifier(apiKey: string): AIModifier {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  return new AIModifier(apiKey);
}

