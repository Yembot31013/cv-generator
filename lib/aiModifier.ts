import { GoogleGenAI } from '@google/genai';
import { CVData, CoverLetter } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import { AIReviewResult } from '@/types/review';
import { GEMINI_MODELS } from './geminiModels';
import { withGeminiRetry } from './geminiRetry';

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

/** Which review feedback items to apply when fixing. */
export type ReviewFixScope = 'all' | 'critical' | 'quick_wins';

/** Grouped review items shown in the Fix with AI dialog. */
export interface ReviewFixGroup {
  label: string;
  items: string[];
}

/** Human-readable scope labels for the fix dialog. */
export const REVIEW_FIX_SCOPE_LABELS: Record<ReviewFixScope, string> = {
  all: 'All review feedback',
  critical: 'Critical issues',
  quick_wins: 'Quick wins',
};

/**
 * Build grouped fix items for UI preview (Fix with AI dialog).
 */
export function getReviewFixGroups(
  review: AIReviewResult,
  scope: ReviewFixScope
): ReviewFixGroup[] {
  const groups: ReviewFixGroup[] = [];
  const { resumeReview, coverLetterReview } = review;

  if (scope === 'all' || scope === 'critical') {
    if (resumeReview.criticalIssues.length) {
      groups.push({ label: 'Resume — Critical issues', items: [...resumeReview.criticalIssues] });
    }
    if (coverLetterReview?.criticalIssues.length) {
      groups.push({
        label: 'Cover letter — Critical issues',
        items: [...coverLetterReview.criticalIssues],
      });
    }
  }

  if (scope === 'all' || scope === 'quick_wins') {
    if (resumeReview.quickWins.length) {
      groups.push({ label: 'Resume — Quick wins', items: [...resumeReview.quickWins] });
    }
    if (coverLetterReview?.quickWins.length) {
      groups.push({ label: 'Cover letter — Quick wins', items: [...coverLetterReview.quickWins] });
    }
  }

  if (scope === 'all') {
    const highPrioritySuggestions = Object.values(resumeReview.categories)
      .filter((c) => c.importance === 'high' && c.suggestions.length > 0)
      .flatMap((c) => c.suggestions.map((s) => `${c.title}: ${s}`));
    if (highPrioritySuggestions.length) {
      groups.push({ label: 'High-priority suggestions', items: highPrioritySuggestions });
    }

    const missingCritical = resumeReview.keywordAnalysis.missingKeywords
      .filter((k) => k.importance === 'critical' && !k.found)
      .map((k) => `Add keyword: ${k.keyword}${k.context ? ` (${k.context})` : ''}`);
    if (missingCritical.length) {
      groups.push({ label: 'Missing critical keywords', items: missingCritical });
    }

    if (coverLetterReview) {
      const clSuggestions = Object.values(coverLetterReview.categories)
        .filter((c) => c.importance === 'high' && c.suggestions.length > 0)
        .flatMap((c) => c.suggestions.map((s) => `${c.title}: ${s}`));
      if (clSuggestions.length) {
        groups.push({ label: 'Cover letter suggestions', items: clSuggestions });
      }
    }
  }

  return groups;
}

function formatReviewFeedback(groups: ReviewFixGroup[]): string {
  if (!groups.length) return 'No actionable feedback in this scope.';
  return groups
    .map((g) => `**${g.label}:**\n${g.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}`)
    .join('\n\n');
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

      const response = await withGeminiRetry(() =>
        this.ai.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents: contents,
          config: {
            tools: [{ urlContext: {} }, { googleSearch: {} }],
          },
        })
      );

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
   * Apply AI Review feedback to the working resume/cover letter.
   *
   * Context model (important for quality):
   * - `workingResume` / `workingCoverLetter` — the documents to edit (current live state).
   * - `baselineResume` / `baselineCoverLetter` — immutable factual reference captured when
   *   the review opened. Used to prevent fabricated or drifted facts across chained fixes.
   * - `review` — advisory feedback only; never treated as ground truth over baseline facts.
   */
  async fixFromReview(
    review: AIReviewResult,
    scope: ReviewFixScope,
    workingResume: CVData,
    workingCoverLetter: CoverLetter | undefined,
    baselineResume: CVData,
    baselineCoverLetter: CoverLetter | undefined,
    jobDescription: JobDescription,
    files?: File[],
    userContext?: string
  ): Promise<ModificationResult> {
    const systemPrompt = this.buildReviewFixPrompt(
      review,
      scope,
      workingResume,
      workingCoverLetter,
      baselineResume,
      baselineCoverLetter,
      jobDescription,
      userContext
    );

    try {
      const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        { text: systemPrompt },
      ];

      if (files && files.length > 0) {
        for (const file of files) {
          const fileData = await this.fileToBase64(file);
          contents.push({
            inlineData: {
              mimeType: file.type,
              data: fileData,
            },
          });
        }
      }

      const response = await withGeminiRetry(() =>
        this.ai.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents,
        })
      );

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return this.validateAndCompleteResult(result, workingResume, workingCoverLetter);
    } catch (error) {
      console.error('AI Review Fix Error:', error);
      throw new Error('Failed to apply review fixes. Please try again.');
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
   * Build a prompt that applies scoped review feedback while preserving factual integrity.
   */
  private buildReviewFixPrompt(
    review: AIReviewResult,
    scope: ReviewFixScope,
    workingResume: CVData,
    workingCoverLetter: CoverLetter | undefined,
    baselineResume: CVData,
    baselineCoverLetter: CoverLetter | undefined,
    job: JobDescription,
    userContext?: string
  ): string {
    const feedback = formatReviewFeedback(getReviewFixGroups(review, scope));
    const trimmedContext = userContext?.trim();

    return `You are an expert resume editor applying TARGETED fixes from an AI review. You edit the WORKING documents below. Review feedback is advisory — factual accuracy comes from the BASELINE reference and any USER-PROVIDED CONTEXT.

**JOB TARGET:**
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}
Location: ${job.location || 'Not specified'}

**SCOPE:** ${scope === 'all' ? 'All actionable review feedback (critical issues + quick wins + high-priority suggestions)' : scope === 'critical' ? 'Critical issues only' : 'Quick wins only'}

**REVIEW FEEDBACK TO ADDRESS:**
${feedback}

${
  trimmedContext
    ? `**USER-PROVIDED CONTEXT (use this to fill gaps — treat as factual when applying fixes):**
${trimmedContext}

When the review asks for missing information (phone, email, URL, metrics, etc.) and the user provided it above, apply it to the WORKING documents. Do not invent values that are not in baseline, working documents, or user context.`
    : `**USER-PROVIDED CONTEXT:** None supplied. If a fix requires missing data (e.g. phone number, URL, metric) that is not in BASELINE or WORKING documents, SKIP that item and note it in "changes" as skipped — ask the user to supply it.`
}

**BASELINE RESUME (factual reference — do NOT invent facts beyond this or user context):**
${JSON.stringify(baselineResume, null, 2)}

${baselineCoverLetter ? `**BASELINE COVER LETTER (factual reference):**
${JSON.stringify(baselineCoverLetter, null, 2)}` : '**BASELINE COVER LETTER:** Not provided'}

**WORKING RESUME (edit this — return the full updated object):**
${JSON.stringify(workingResume, null, 2)}

${workingCoverLetter ? `**WORKING COVER LETTER (edit this if cover letter feedback applies):**
${JSON.stringify(workingCoverLetter, null, 2)}` : '**WORKING COVER LETTER:** Not provided'}

---

**YOUR TASK:**
Apply ONLY the review feedback listed above to the WORKING documents. Improve wording, keywords, structure, and alignment with the job — without corrupting factual data.

**NON-NEGOTIABLE RULES:**

1. **BASELINE + USER CONTEXT ARE FACTUAL GROUND TRUTH**
   - Employers, dates, degrees, certifications, job titles, and contact details must match the BASELINE unless the review explicitly flags an error AND you can correct it using information in BASELINE, WORKING documents, or USER-PROVIDED CONTEXT.
   - NEVER invent employers, projects, metrics, degrees, or dates that are not supported by BASELINE, WORKING data, or USER-PROVIDED CONTEXT.

2. **REVIEW FEEDBACK IS ADVISORY**
   - If a review suggestion would require fabricating experience or changing verified facts, SKIP that suggestion and note it in "changes" as skipped.
   - Do not blindly follow feedback that contradicts baseline facts.

3. **MINIMAL, TARGETED EDITS**
   - Change only what is needed to address the listed feedback.
   - Preserve all sections, IDs, and entries unless the review explicitly says to remove or restructure them.
   - Prefer strengthening existing bullets over adding fictional achievements.

4. **RETURN COMPLETE OBJECTS**
   - Return the FULL modified resume and/or cover letter objects, not partial patches.
   - Keep the same JSON schema as the working documents.

5. **COVER LETTER**
   - Only modify the cover letter if feedback applies to it or scope includes cover letter issues.
   - If no cover letter feedback, set modifiedCoverLetter to null.

**RESPONSE FORMAT (JSON only):**
\`\`\`json
{
  "success": true,
  "type": "resume" | "coverLetter" | "both",
  "message": "Brief summary of what was fixed and anything skipped",
  "changes": ["Specific change 1", "Skipped: reason if any"],
  "modifiedResume": { /* full resume or null */ },
  "modifiedCoverLetter": { /* full cover letter or null */ }
}
\`\`\`

If nothing can be safely fixed without fabricating data:
\`\`\`json
{
  "success": false,
  "type": "invalid",
  "message": "Explain what blocked safe fixes",
  "changes": []
}
\`\`\``;
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

