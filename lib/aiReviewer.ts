import { GoogleGenAI } from '@google/genai';
import { CVData } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import { AIReviewResult, getScoreLevel } from '@/types/review';

/**
 * Chat message for review history
 */
export interface ReviewChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Review session that maintains conversation context
 */
export interface ReviewSession {
  history: ReviewChatMessage[];
  reviewCount: number;
  lastReviewResult?: AIReviewResult;
}

/**
 * AI-powered Resume and Cover Letter Reviewer using Google Gemini
 * Uses chat API to maintain context between re-analyses
 */
export class AIReviewer {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Review resume and cover letter against job description
   * Supports context-aware re-analysis through chat history
   */
  async reviewApplicationMaterials(
    cvData: CVData,
    jobDescription: JobDescription,
    coverLetter?: string,
    session?: ReviewSession
  ): Promise<{ result: AIReviewResult; session: ReviewSession }> {
    const isReAnalysis = session && session.reviewCount > 0;
    const reviewNumber = (session?.reviewCount || 0) + 1;
    
    // Build the appropriate prompt based on whether this is first review or re-analysis
    const prompt = isReAnalysis 
      ? this.buildReAnalysisPrompt(cvData, jobDescription, coverLetter, session!)
      : this.buildReviewPrompt(cvData, jobDescription, coverLetter);

    try {
      let responseText: string;
      let newHistory: ReviewChatMessage[];

      if (isReAnalysis && session!.history.length > 0) {
        // Use chat API with history for re-analysis
        const chat = this.ai.chats.create({
          model: 'gemini-2.0-flash-exp',
          history: session!.history,
        });

        const response = await chat.sendMessage({
          message: prompt,
        });

        responseText = response.text || "";
        
        // Update history with the new exchange
        newHistory = [
          ...session!.history,
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'model', parts: [{ text: responseText }] },
        ];
      } else {
        // First review - use single generation
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: [{ text: prompt }],
        });

        responseText = response.text || "";
        
        // Initialize history with this first exchange
        newHistory = [
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'model', parts: [{ text: responseText }] },
        ];
      }

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const reviewData = JSON.parse(jsonMatch[0]);
      const result = this.validateAndCompleteReview(reviewData, jobDescription);

      // Return both the result and updated session
      return {
        result,
        session: {
          history: newHistory,
          reviewCount: reviewNumber,
          lastReviewResult: result,
        },
      };
    } catch (error) {
      console.error('AI Review Error:', error);
      throw new Error('Failed to review application materials. Please try again.');
    }
  }

  /**
   * Build re-analysis prompt that provides context about previous review
   */
  private buildReAnalysisPrompt(
    cv: CVData,
    job: JobDescription,
    coverLetter: string | undefined,
    session: ReviewSession
  ): string {
    const previousResult = session.lastReviewResult;
    
    return `**🔄 RE-ANALYSIS REQUEST (Review #${session.reviewCount + 1})**

The user has clicked "Re-analyze" after seeing your previous review. This means:
1. They may have made changes to address your feedback
2. OR they want a fresh perspective / second opinion
3. They're counting on you to track their progress

**WHAT YOU PREVIOUSLY SAID (Review #${session.reviewCount}):**
- Overall Score: ${previousResult?.resumeReview.overallScore}/100 (${previousResult?.resumeReview.overallLevel})
- Summary: "${previousResult?.resumeReview.summary}"

**Critical Issues You Previously Identified:**
${previousResult?.resumeReview.criticalIssues.length ? 
  previousResult.resumeReview.criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : 
  '- None identified'}

**Quick Wins You Previously Suggested:**
${previousResult?.resumeReview.quickWins.length ?
  previousResult.resumeReview.quickWins.map((win, i) => `${i + 1}. ${win}`).join('\n') :
  '- None suggested'}

**Previous Contact Info Score:** ${previousResult?.resumeReview.sectionReviews.find(s => s.sectionName === 'Contact Information')?.score || 'N/A'}/100

---

**YOUR RE-ANALYSIS INSTRUCTIONS:**

1. **COMPARE THE CURRENT DATA WITH YOUR PREVIOUS FEEDBACK:**
   - Look at the resume data below - has ANYTHING changed since your last review?
   - If the email was fake before, is it STILL fake?
   - If the phone had X's, does it STILL have X's?

2. **BE CONSISTENT:**
   - If an issue existed before and STILL exists, flag it again
   - Don't suddenly say something is fine if it wasn't fixed
   - Don't contradict yourself unless there's a real change

3. **ACKNOWLEDGE IMPROVEMENTS:**
   - If something was fixed, celebrate it! "Great job updating your email to a real address"
   - Show the user their progress

4. **AVOID INFINITE LOOPS:**
   - If this is review #${session.reviewCount + 1} and the same issues persist, be direct:
     "This is review #${session.reviewCount + 1} and [specific issue] still hasn't been fixed. Please update [specific field] before re-analyzing."
   - Help them understand they need to actually make changes

5. **SCORE CHANGES SHOULD REFLECT REALITY:**
   - If nothing changed → Score should be similar (±5 points for perspective)
   - If issues were fixed → Score should improve
   - If new issues appeared → Score should drop
   - Explain WHY the score changed (or didn't)

---

**CURRENT RESUME DATA (Review this against your previous feedback):**

${JSON.stringify(cv, null, 2)}

${coverLetter ? `**CURRENT COVER LETTER:**
${coverLetter}` : '**COVER LETTER:** Not provided'}

**JOB BEING APPLIED FOR:**
Title: ${job.title || 'Not specified'}
Company: ${job.company || 'Not specified'}

---

Now provide your re-analysis. Remember:
- You have memory of what you said before
- Be consistent and track progress
- Help the user improve, don't just repeat the same feedback if nothing changed
- If they haven't made changes, gently tell them to actually update the resume before re-analyzing

Respond with the same JSON format as before.`;
  }

  /**
   * Build the review prompt for Gemini
   */
  private buildReviewPrompt(cv: CVData, job: JobDescription, coverLetter?: string): string {
    return `You are an elite ATS (Applicant Tracking System) analyst, senior hiring manager, and professional resume reviewer with 20+ years of experience. You have an obsessive eye for detail and NEVER miss anything. Your task is to provide an EXHAUSTIVE, meticulous review of the application materials.

**⚠️ CRITICAL CONTEXT - READ CAREFULLY:**
This is the ACTUAL resume the candidate will submit to employers. This is NOT masked, sanitized, or anonymized data. Every value you see is EXACTLY what will appear on their real application. Your review has REAL consequences - if you miss a problem, the candidate could submit a flawed resume and lose job opportunities. Treat this as if a friend handed you their resume and asked "Can you check this before I apply?"

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

**Resume Data:**
${JSON.stringify(cv, null, 2)}

${coverLetter ? `**Cover Letter:**
${coverLetter}` : '**Cover Letter:** Not provided'}

**YOUR MISSION - BE THE CANDIDATE'S BEST FRIEND:**
Review this resume as if your friend's career depends on it (because it does). Be thorough, honest, and helpful. Mistakes happen - people forget to update their email, leave placeholder text, or miss obvious errors. Your job is to catch EVERYTHING before it's too late.

**🚨🚨🚨 CRITICAL: DETECTING FAKE/DUMMY/PLACEHOLDER DATA 🚨🚨🚨**

THIS IS THE MOST IMPORTANT PART OF YOUR REVIEW. People often forget to replace placeholder values. You MUST catch these - if you don't, the candidate will submit a resume with fake contact info and NEVER get called back!

**DUMMY EMAIL PATTERNS (If you see ANY of these, it's INVALID - score Contact Info LOW!):**
- Contains "example" anywhere: "name@example.com", "user.example@email.com", "test@example.org"
- Contains "test": "test@test.com", "testuser@gmail.com"  
- Contains "sample", "demo", "placeholder", "dummy"
- Generic patterns: "email@domain.com", "your.email@company.com", "user@email.com"
- Has "xxx" or "XXX": "xxx@xxx.com"
- The domain "email.com" is suspicious - real people use gmail, yahoo, outlook, or company domains
- EXAMPLE: "emmanuel.example@email.com" → This contains BOTH "example" AND uses "email.com" domain = CLEARLY FAKE!

**DUMMY PHONE PATTERNS (If you see ANY of these, it's INVALID!):**
- Contains "X" or "x" as placeholders: "+234 80XXXXXXXX", "555-XXX-XXXX", "+1 XXX XXX XXXX"
- Sequential numbers: "1234567890", "123-456-7890"
- All zeros: "0000000000", "000-000-0000"
- Fake US prefix 555: "(555) 555-5555"
- Incomplete: missing digits, too short, too long
- EXAMPLE: "+234 80XXXXXXXX" → The "XXXXXXXX" are literal placeholder X's = OBVIOUSLY FAKE!

**DUMMY WEBSITE/URL PATTERNS:**
- Contains "example.com" or "example.org": These are RESERVED domains for documentation, NEVER real!
- "https://www.example.com" = 100% FAKE, this is the official placeholder domain
- Contains "yourwebsite", "yourportfolio", "mysite"
- Generic: "website.com", "portfolio.com"

**DUMMY LINKEDIN/GITHUB:**
- "linkedin.com/in/yourprofile", "linkedin.com/in/username", "linkedin.com/in/your-name"
- "github.com/username", "github.com/yourusername"
- Any URL that looks like a template rather than a real profile

**DUMMY NAMES:**
- "John Doe", "Jane Doe", "John Smith", "Jane Smith" - classic placeholders
- "Test User", "Your Name", "Full Name", "First Last"
- Single word when full name expected

**DUMMY LOCATIONS:**
- "City, State", "City, Country", "Your City", "Location"
- "123 Main Street" - classic fake address

**OTHER PLACEHOLDERS TO CATCH:**
- Literal "X" characters used as placeholders (XXXXXXXX, XXX-XXX)
- "Lorem ipsum", "TBD", "TODO", "N/A", "FIXME"
- "[Your text here]", "<insert>", "..."
- Empty strings "" where data should be
- "Company Name", "Job Title", "Your Position"

**⚠️ IMPORTANT: If you see patterns like:**
- Email containing "example" → FAKE
- Phone containing "X" → FAKE  
- URL containing "example.com" → FAKE
- Any field with obvious template text → FAKE

**These should result in CRITICAL ISSUES and LOW SCORES for Contact Information. A recruiter CANNOT contact someone at "example@email.com" or "+234 80XXXXXXXX"!**

**THOROUGH CHECKS - VERIFY EVERYTHING:**

1. **CONTACT INFORMATION (Most Critical - Without this, the resume is USELESS!):**
   - Email: Is it a REAL email that belongs to a real person? Not a placeholder?
   - Phone: Is it a REAL phone number with correct digit count? Not fake 555 numbers?
   - Location: Is it a real city/country? Not "City, State"?
   - LinkedIn: Is it a real LinkedIn profile URL? Not "linkedin.com/in/yourprofile"?
   - GitHub: For tech roles, is it a real GitHub? Not "github.com/username"?

2. **PERSONAL INFO QUALITY:**
   - Full Name: Is it a real person's name? Not "John Doe"?
   - Professional Title: Does it align with the target role?
   - Bio/Summary: Is it written specifically for this role? Not generic?

3. **EXPERIENCE SECTION:**
   - Real company names? Not "Company Name" or "Previous Employer"?
   - Real dates? Are they in the past (not future dates by mistake)?
   - Achievement-focused bullet points with real metrics?
   - Technologies that actually match the job requirements?

4. **SKILLS SECTION:**
   - Relevant to the job description?
   - Any critical skills from the job posting that are missing?

5. **EDUCATION SECTION:**
   - Real institution names?
   - Reasonable dates?

6. **PROJECTS SECTION:**
   - Real project descriptions?
   - Working links (if provided)?

**🔍 CONSISTENCY & LOGIC CHECKS (Very Important!):**

This resume will be submitted AS-IS. Any inconsistency will make the candidate look careless or dishonest. Check for:

**Timeline Inconsistencies:**
- Do work experience dates overlap impossibly? (Working 2 full-time jobs simultaneously)
- Do education dates make sense? (Can't graduate before starting)
- Is the career progression logical? (Junior → Senior makes sense; CEO → Intern doesn't)
- Do years of experience claimed match the actual timeline?
- Any future dates that shouldn't be there?

**Title vs Content Mismatch:**
- Does the professional title match their experience? (Claiming "Senior Developer" with only 1 year of experience)
- Do job titles align with the responsibilities described?
- Does the bio/summary match what the experience actually shows?

**Skills vs Experience Mismatch:**
- Are listed skills actually demonstrated in the experience or projects?
- Claims expertise in a technology but no mention of it anywhere else?
- Skills that don't make sense together or for the role?

**Education vs Experience Logic:**
- Did they work while supposedly in full-time education? (Possible but worth noting)
- Do claimed degrees align with the career path?
- Graduation dates that don't match age implications from experience?

**Numbers That Don't Add Up:**
- "Led a team of 50" at a 10-person startup?
- "Increased revenue by 500%" - is this realistic for the role?
- Metrics that seem inflated or impossible?

**Name/Identity Consistency:**
- Does the name in personal info match anywhere else mentioned?
- Is the location consistent throughout?

**Role-Specific Alignment:**
- Is this resume actually tailored for THIS job?
- Or does it look like a generic resume sent to any job?
- Does the candidate's background actually qualify them for this role?

**RED FLAGS to call out:**
- Career gaps with no explanation
- Demotions without context
- Very short stints at companies (job hopping)
- Missing key information for claims made
- Anything that would make a recruiter say "wait, that doesn't add up..."

**SCORING PHILOSOPHY:**
Score based on how likely this resume is to:
1. Pass ATS screening
2. Get the candidate an interview
3. Present them as a strong candidate

Consider the REAL-WORLD IMPACT of each issue:
- Missing/fake contact info = Recruiter literally cannot reach them = Devastating
- Poor job alignment = Won't pass initial screening = Very serious
- Missing keywords = ATS rejection = Serious
- Formatting issues = Poor impression = Moderate
- Minor improvements possible = Normal for any resume

Be fair but honest. A resume with dummy contact info should score very low regardless of how good the rest looks - what's the point of a great resume if no one can contact you?

**SCORING RANGES (Use your professional judgment):**
- 90-100: Exceptional. Ready to submit. All information complete, real, and tailored. Rare to see.
- 75-89: Strong resume. Minor improvements possible but overall effective.
- 60-74: Decent but has noticeable issues that should be fixed before submitting.
- 40-59: Needs significant work. Has problems that would hurt the candidate's chances.
- 20-39: Serious issues. Multiple critical problems like missing/fake contact info.
- 0-19: Unusable. Placeholder content, fake data, or fundamentally broken.

**THINK LIKE A RECRUITER:**
Ask yourself: "If I received this resume, would I..."
- Be able to contact this person? (Check contact info is REAL - no "example", no "XXXX", no placeholder domains)
- Understand what they do? (Check title and bio)

**⚠️ BEFORE SCORING CONTACT INFORMATION - ASK YOURSELF:**
1. Does the email contain "example", "test", "sample", or look like a template? → If YES, score LOW
2. Does the phone have "X" characters, all zeros, or look incomplete? → If YES, score LOW
3. Does any URL use "example.com"? → If YES, score LOW
4. Could a recruiter ACTUALLY reach this person with this contact info? → If NO, score LOW

Real example of FAKE contact info that should score LOW:
- Email: "emmanuel.example@email.com" ← Contains "example" AND suspicious "email.com" domain = FAKE
- Phone: "+234 80XXXXXXXX" ← Has literal "X" placeholders = FAKE
- Website: "https://www.example.com" ← Uses example.com = FAKE
If you see contact info like this, the Contact Information section should score 20-40, NOT 100!
- See them as qualified? (Check experience relevance)
- Forward them to the hiring manager? (Overall impression)

If the answer to any critical question is "no", reflect that honestly in your score.

**Output Format:**
Return ONLY a valid JSON object with this exact structure:

{
  "resumeReview": {
    "overallScore": 0-100,
    "summary": "2-3 sentence executive summary of the resume quality",
    "categories": {
      "jobAlignment": {
        "score": 0-100,
        "title": "Job Alignment",
        "description": "How well the resume matches the specific job requirements",
        "suggestions": ["specific actionable suggestion 1", "suggestion 2"],
        "importance": "high",
        "tooltip": "Measures how closely your experience, skills, and achievements align with what the employer is seeking. A high score means your profile is a strong match for this specific role."
      },
      "impactStatements": {
        "score": 0-100,
        "title": "Impact Statements",
        "description": "Quality of achievement-focused bullet points",
        "suggestions": ["specific suggestion 1", "suggestion 2"],
        "importance": "high",
        "tooltip": "Evaluates whether your bullet points show concrete results and achievements rather than just listing duties. Strong impact statements start with action verbs and include measurable outcomes."
      },
      "skillsMatch": {
        "score": 0-100,
        "title": "Skills Match",
        "description": "How well listed skills match job requirements",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "high",
        "tooltip": "Compares your listed skills against the required and preferred skills in the job posting. Missing critical skills significantly reduces your chances of passing ATS screening."
      },
      "experienceRelevance": {
        "score": 0-100,
        "title": "Experience Relevance",
        "description": "Relevance of work experience to the target role",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "high",
        "tooltip": "Assesses whether your work history demonstrates progression and experience relevant to the target position. Recent, directly relevant experience scores highest."
      },
      "quantifiableResults": {
        "score": 0-100,
        "title": "Quantifiable Results",
        "description": "Use of metrics, numbers, and measurable achievements",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "medium",
        "tooltip": "Measures the presence of specific numbers, percentages, and metrics in your achievements. Quantified results (e.g., 'increased sales by 40%') are 2-3x more memorable to recruiters."
      },
      "professionalFormatting": {
        "score": 0-100,
        "title": "Professional Formatting",
        "description": "Structure, organization, and presentation quality",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "medium",
        "tooltip": "Evaluates the overall structure, readability, and professional appearance. Well-organized resumes are easier to scan and make a better first impression."
      },
      "keywordOptimization": {
        "score": 0-100,
        "title": "Keyword Optimization",
        "description": "Use of industry and job-specific keywords for ATS",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "high",
        "tooltip": "Measures how well your resume includes keywords from the job description. 75% of resumes are rejected by ATS before a human sees them due to missing keywords."
      },
      "readability": {
        "score": 0-100,
        "title": "Readability",
        "description": "Clarity, conciseness, and ease of reading",
        "suggestions": ["suggestion 1", "suggestion 2"],
        "importance": "medium",
        "tooltip": "Assesses how easy it is to quickly scan and understand your resume. Recruiters spend an average of 6-7 seconds on initial resume screening."
      }
    },
    "keywordAnalysis": {
      "matchedKeywords": [
        {"keyword": "keyword", "found": true, "context": "Found in skills section", "importance": "critical"},
        {"keyword": "keyword2", "found": true, "context": "Found in experience", "importance": "important"}
      ],
      "missingKeywords": [
        {"keyword": "missing keyword", "found": false, "context": "Consider adding to skills", "importance": "critical"},
        {"keyword": "missing keyword2", "found": false, "context": "Mention in experience if applicable", "importance": "important"}
      ],
      "matchRate": 0-100
    },
    "sectionReviews": [
      {
        "sectionName": "Contact Information",
        "score": 0-100,
        "feedback": "CRITICAL: Check email, phone, LinkedIn, location. If any are missing/invalid, score LOW!",
        "strengths": ["what contact info is present and valid"],
        "improvements": ["what contact info is missing or invalid - BE SPECIFIC about what's wrong"]
      },
      {
        "sectionName": "Professional Summary",
        "score": 0-100,
        "feedback": "Is the bio/summary compelling and tailored to the job?",
        "strengths": ["strength if any"],
        "improvements": ["what could be better"]
      },
      {
        "sectionName": "Work Experience",
        "score": 0-100,
        "feedback": "Check: dates, job titles, companies, achievement-focused bullets, metrics",
        "strengths": ["strength 1"],
        "improvements": ["improvement 1"]
      },
      {
        "sectionName": "Skills",
        "score": 0-100,
        "feedback": "Check: skill relevance to job, categorization, missing critical skills",
        "strengths": ["strength 1"],
        "improvements": ["improvement 1"]
      },
      {
        "sectionName": "Projects",
        "score": 0-100,
        "feedback": "Check: descriptions, technologies used, links/repos, relevance to job",
        "strengths": ["strength 1"],
        "improvements": ["improvement 1"]
      },
      {
        "sectionName": "Education",
        "score": 0-100,
        "feedback": "Check: institution, degree, dates, relevance",
        "strengths": ["strength 1"],
        "improvements": ["improvement 1"]
      }
    ],
    "topStrengths": ["Top strength 1 - be specific", "Top strength 2", "Top strength 3"],
    "criticalIssues": ["MUST list any missing contact info here!", "Any placeholder/fake data", "Any major gaps"],
    "quickWins": ["Easy fix 1 that would immediately boost score", "Easy fix 2", "Easy fix 3"]
  },
  ${coverLetter ? `"coverLetterReview": {
    "overallScore": 0-100,
    "summary": "2-3 sentence summary of cover letter quality - mention any critical issues",
    "categories": {
      "openingImpact": {
        "score": 0-100,
        "title": "Opening Impact",
        "description": "How compelling and attention-grabbing the opening is",
        "suggestions": ["suggestion 1"],
        "importance": "high",
        "tooltip": "The first paragraph determines whether the hiring manager keeps reading. A strong opening hooks the reader with a specific, compelling reason you're the right fit."
      },
      "companyKnowledge": {
        "score": 0-100,
        "title": "Company Knowledge",
        "description": "Demonstration of research about the company",
        "suggestions": ["suggestion 1"],
        "importance": "medium",
        "tooltip": "Shows whether you've researched the company and can articulate why you want to work there specifically. Generic letters score low here."
      },
      "valueProposition": {
        "score": 0-100,
        "title": "Value Proposition",
        "description": "Clarity of what unique value you bring",
        "suggestions": ["suggestion 1"],
        "importance": "high",
        "tooltip": "Measures how clearly you communicate what you can do for the employer. The best cover letters answer 'What's in it for us?' definitively."
      },
      "relevantExamples": {
        "score": 0-100,
        "title": "Relevant Examples",
        "description": "Use of specific, relevant achievements",
        "suggestions": ["suggestion 1"],
        "importance": "high",
        "tooltip": "Evaluates whether you back up claims with specific examples from your experience. Concrete examples are far more persuasive than generic statements."
      },
      "enthusiasm": {
        "score": 0-100,
        "title": "Enthusiasm",
        "description": "Genuine interest and passion for the role",
        "suggestions": ["suggestion 1"],
        "importance": "medium",
        "tooltip": "Captures whether your interest in the role comes across as authentic. Employers want to hire people who are genuinely excited about the opportunity."
      },
      "callToAction": {
        "score": 0-100,
        "title": "Call to Action",
        "description": "Strength of the closing and next steps",
        "suggestions": ["suggestion 1"],
        "importance": "medium",
        "tooltip": "The closing should confidently invite next steps without being pushy. A weak closing leaves the reader uncertain about what to do next."
      },
      "tone": {
        "score": 0-100,
        "title": "Professional Tone",
        "description": "Appropriateness of language and tone",
        "suggestions": ["suggestion 1"],
        "importance": "medium",
        "tooltip": "Assesses whether the tone is professional yet personable. Too formal feels cold; too casual feels unprofessional."
      },
      "length": {
        "score": 0-100,
        "title": "Optimal Length",
        "description": "Whether the length is appropriate (not too long/short)",
        "suggestions": ["suggestion 1"],
        "importance": "low",
        "tooltip": "The ideal cover letter is 250-400 words (3-4 paragraphs). Too long and it won't be read; too short and it seems low-effort."
      }
    },
    "topStrengths": ["Strength 1", "Strength 2"],
    "criticalIssues": ["Issue 1 if any - be thorough"],
    "quickWins": ["Quick win 1", "Quick win 2"]
  },` : '"coverLetterReview": null,'}
  "compatibilityScore": 0-100
}

**BEFORE YOU RESPOND - MENTAL CHECKLIST:**

□ EMAIL CHECK: Does it contain "example", "test", "sample"? Does it use suspicious domains like "email.com"? → If yes, mark as FAKE
□ PHONE CHECK: Does it contain "X" or "x" characters? Is it all zeros or sequential? → If yes, mark as FAKE
□ URL CHECK: Does any URL use "example.com" or "example.org"? → If yes, mark as FAKE
□ NAME CHECK: Is it "John Doe", "Jane Doe", "Your Name"? → If yes, mark as FAKE
□ Did I check for ANY placeholder text (XXX, TBD, Lorem ipsum)?
□ Did I catch any empty fields that should have data?
□ Do the dates make sense? (No impossible overlaps, no future dates)
□ Does the title match the experience level shown?
□ Do the skills match what's demonstrated in experience/projects?
□ Are there any claims that don't add up or seem exaggerated?
□ Is this resume actually tailored for THIS specific job?

**FINAL CONTACT INFO SANITY CHECK:**
Look at the actual email, phone, and URLs one more time:
- If email has "example" or uses "email.com" domain → Contact Info score should be LOW (20-40)
- If phone has X's or looks incomplete → Contact Info score should be LOW (20-40)
- If website is "example.com" → This is a RESERVED placeholder domain, mark it!

A resume with placeholder contact info is USELESS. The score should reflect that!

**IMPORTANT PRINCIPLES:**

1. **Be the candidate's advocate** - You want them to succeed, so don't let obvious problems slip through
2. **Be specific** - Don't say "improve contact info", say "Email 'test@example.com' appears to be a placeholder - add your real email"
3. **Be honest** - A kind lie helps no one. If the resume has problems, say so clearly
4. **Think impact** - Prioritize issues by how much they'd hurt the candidate's chances
5. **Be constructive** - Every criticism should come with a clear path to fix it

**Your review could be the difference between this candidate getting their dream job or being ignored. Take it seriously.**`;
  }

  /**
   * Validate and complete the review data
   */
  private validateAndCompleteReview(data: any, job: JobDescription): AIReviewResult {
    // Helper to ensure score breakdown has all required fields
    const ensureScoreBreakdown = (item: any, defaults: any): any => ({
      score: item?.score ?? 50,
      level: getScoreLevel(item?.score ?? 50),
      title: item?.title ?? defaults.title,
      description: item?.description ?? '',
      suggestions: Array.isArray(item?.suggestions) ? item.suggestions : [],
      importance: item?.importance ?? 'medium',
      tooltip: item?.tooltip ?? defaults.tooltip,
    });

    // Default tooltips for resume categories
    const resumeDefaults = {
      jobAlignment: { title: 'Job Alignment', tooltip: 'Measures how closely your profile matches the specific job requirements.' },
      impactStatements: { title: 'Impact Statements', tooltip: 'Evaluates the quality of your achievement-focused bullet points.' },
      skillsMatch: { title: 'Skills Match', tooltip: 'Compares your skills against job requirements.' },
      experienceRelevance: { title: 'Experience Relevance', tooltip: 'Assesses how relevant your work history is to the target role.' },
      quantifiableResults: { title: 'Quantifiable Results', tooltip: 'Measures the presence of specific metrics in your achievements.' },
      professionalFormatting: { title: 'Professional Formatting', tooltip: 'Evaluates structure and presentation quality.' },
      keywordOptimization: { title: 'Keyword Optimization', tooltip: 'Measures ATS-friendly keyword usage.' },
      readability: { title: 'Readability', tooltip: 'Assesses clarity and ease of reading.' },
    };

    // Default tooltips for cover letter categories
    const coverLetterDefaults = {
      openingImpact: { title: 'Opening Impact', tooltip: 'How compelling your opening paragraph is.' },
      companyKnowledge: { title: 'Company Knowledge', tooltip: 'Demonstration of research about the company.' },
      valueProposition: { title: 'Value Proposition', tooltip: 'Clarity of what unique value you bring.' },
      relevantExamples: { title: 'Relevant Examples', tooltip: 'Use of specific, relevant achievements.' },
      enthusiasm: { title: 'Enthusiasm', tooltip: 'Genuine interest in the role.' },
      callToAction: { title: 'Call to Action', tooltip: 'Strength of your closing.' },
      tone: { title: 'Professional Tone', tooltip: 'Appropriateness of language and tone.' },
      length: { title: 'Optimal Length', tooltip: 'Whether the length is appropriate.' },
    };

    const resumeReview = data.resumeReview || {};
    const coverLetterReview = data.coverLetterReview;

    return {
      resumeReview: {
        overallScore: resumeReview.overallScore ?? 50,
        overallLevel: getScoreLevel(resumeReview.overallScore ?? 50),
        summary: resumeReview.summary ?? 'Review completed.',
        categories: {
          jobAlignment: ensureScoreBreakdown(resumeReview.categories?.jobAlignment, resumeDefaults.jobAlignment),
          impactStatements: ensureScoreBreakdown(resumeReview.categories?.impactStatements, resumeDefaults.impactStatements),
          skillsMatch: ensureScoreBreakdown(resumeReview.categories?.skillsMatch, resumeDefaults.skillsMatch),
          experienceRelevance: ensureScoreBreakdown(resumeReview.categories?.experienceRelevance, resumeDefaults.experienceRelevance),
          quantifiableResults: ensureScoreBreakdown(resumeReview.categories?.quantifiableResults, resumeDefaults.quantifiableResults),
          professionalFormatting: ensureScoreBreakdown(resumeReview.categories?.professionalFormatting, resumeDefaults.professionalFormatting),
          keywordOptimization: ensureScoreBreakdown(resumeReview.categories?.keywordOptimization, resumeDefaults.keywordOptimization),
          readability: ensureScoreBreakdown(resumeReview.categories?.readability, resumeDefaults.readability),
        },
        keywordAnalysis: {
          matchedKeywords: Array.isArray(resumeReview.keywordAnalysis?.matchedKeywords) 
            ? resumeReview.keywordAnalysis.matchedKeywords 
            : [],
          missingKeywords: Array.isArray(resumeReview.keywordAnalysis?.missingKeywords) 
            ? resumeReview.keywordAnalysis.missingKeywords 
            : [],
          matchRate: resumeReview.keywordAnalysis?.matchRate ?? 0,
        },
        sectionReviews: Array.isArray(resumeReview.sectionReviews) 
          ? resumeReview.sectionReviews 
          : [],
        topStrengths: Array.isArray(resumeReview.topStrengths) 
          ? resumeReview.topStrengths 
          : [],
        criticalIssues: Array.isArray(resumeReview.criticalIssues) 
          ? resumeReview.criticalIssues 
          : [],
        quickWins: Array.isArray(resumeReview.quickWins) 
          ? resumeReview.quickWins 
          : [],
      },
      coverLetterReview: coverLetterReview ? {
        overallScore: coverLetterReview.overallScore ?? 50,
        overallLevel: getScoreLevel(coverLetterReview.overallScore ?? 50),
        summary: coverLetterReview.summary ?? 'Review completed.',
        categories: {
          openingImpact: ensureScoreBreakdown(coverLetterReview.categories?.openingImpact, coverLetterDefaults.openingImpact),
          companyKnowledge: ensureScoreBreakdown(coverLetterReview.categories?.companyKnowledge, coverLetterDefaults.companyKnowledge),
          valueProposition: ensureScoreBreakdown(coverLetterReview.categories?.valueProposition, coverLetterDefaults.valueProposition),
          relevantExamples: ensureScoreBreakdown(coverLetterReview.categories?.relevantExamples, coverLetterDefaults.relevantExamples),
          enthusiasm: ensureScoreBreakdown(coverLetterReview.categories?.enthusiasm, coverLetterDefaults.enthusiasm),
          callToAction: ensureScoreBreakdown(coverLetterReview.categories?.callToAction, coverLetterDefaults.callToAction),
          tone: ensureScoreBreakdown(coverLetterReview.categories?.tone, coverLetterDefaults.tone),
          length: ensureScoreBreakdown(coverLetterReview.categories?.length, coverLetterDefaults.length),
        },
        topStrengths: Array.isArray(coverLetterReview.topStrengths) 
          ? coverLetterReview.topStrengths 
          : [],
        criticalIssues: Array.isArray(coverLetterReview.criticalIssues) 
          ? coverLetterReview.criticalIssues 
          : [],
        quickWins: Array.isArray(coverLetterReview.quickWins) 
          ? coverLetterReview.quickWins 
          : [],
      } : undefined,
      compatibilityScore: data.compatibilityScore ?? 50,
      reviewedAt: new Date().toISOString(),
      jobTitle: job.title,
      company: job.company,
    };
  }
}

/**
 * Initialize AI Reviewer with API key
 */
export function createAIReviewer(apiKey: string): AIReviewer {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  return new AIReviewer(apiKey);
}

