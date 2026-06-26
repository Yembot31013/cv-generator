# 🤖 AI-Native CV Generator

> An intelligent, AI-powered CV generator that extracts, enhances, tailors, and reviews your resume using Google Gemini. Upload your resume, provide a job description, and let AI create a perfectly tailored CV with beautiful templates.

[![GitHub](https://img.shields.io/badge/GitHub-Yembot31013%2Fcv--generator-181717?style=for-the-badge&logo=github)](https://github.com/Yembot31013/cv-generator)
[![License](https://img.shields.io/badge/License-Non--Commercial-red?style=for-the-badge)](LICENSE)

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🎯 Core AI Features

- 🤖 **AI-Powered Extraction** - Upload PDF, DOCX, or JSON files. Gemini 2.5 Pro extracts all CV data intelligently
- 🎯 **Job-Specific Tailoring** - AI rewrites your resume to match job descriptions with keyword optimization
- 📊 **AI Review & Scoring** - Get comprehensive ATS analysis, keyword matching, and improvement suggestions
- ✨ **Fix with AI** - Apply review feedback with a confirmation dialog; add missing details (phone, URLs, metrics) before fixes run
- ✨ **AI Enhancement** - Automatically adds metrics, achievements, and missing details based on industry standards
- 📝 **AI Cover Letter Generation** - Creates personalized cover letters tailored to each job application
- 🔧 **AI Modifier** - Make instant changes with natural language prompts ("Add Python to skills", "Update email to...")
- 📥 **PDF Download** - Export resume and cover letter as clean, ATS-friendly PDFs matched to your selected template theme
- 🧠 **Thinking Mode** - Uses Gemini 2.5 Pro with deep reasoning for intelligent data extraction and merging
- 📚 **Multiple File Support** - Upload multiple resumes/documents and AI merges them intelligently

## 🎨 Design Features

- ✨ **4 Beautiful Templates** - Cyber Web3, Neon Retro, Glassmorphic, Minimal Pro
- 🌓 **Dark/Light Themes** - Optimized for both modes
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚛️ **Type-Safe** - Complete TypeScript support

---

## 🔐 API Key Transparency

This project is open-sourced to ensure full transparency.

Users provide their own **Google Gemini API key** via the in-app settings UI. Keys are stored **locally in your browser** (`localStorage`) and are **never sent to any server** controlled by the author.

All AI requests run **client-side** from your browser directly to Google's Gemini API. You are encouraged to review the source code to verify this.

> **Multi-provider support (planned):** Today only **Google Gemini** is wired end-to-end. Support for other providers — OpenAI, Anthropic (Claude), and others — is on the roadmap. See [Multi-provider AI](#3-multi-provider-ai-support-planned) under open feature requests.

**Supported key formats:** Legacy `AIza…` keys and newer `AQ.…` auth keys from [Google AI Studio](https://aistudio.google.com/apikey).

**Model selection:** After adding a key, use the **AI Models** panel to pick Gemini versions per task. Only models marked `active: true` in `lib/aiModels.ts` appear in the dropdowns. To add or retire models, update that catalog — stored preferences auto-migrate when a model is deactivated.

---

## 🚀 Quick Start

### 1. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Configure AI Settings

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Open the app and click **AI Settings** in the wizard header
3. Paste your Gemini API key — it is stored **only in your browser** (`localStorage`), never on a server
4. Choose which **Gemini models** power each task:
   - **Fast model** — enhancement, review, job parsing, cover letter, and edits
   - **Extraction model** — reading PDF/DOCX uploads (recommended: Gemini 2.5 Pro)

Model preferences are saved locally alongside your API key. The app only lists **active, supported** models from `lib/aiModels.ts` — retired models are migrated to the current default automatically.

> **Note:** This app does not use `.env` files. All configuration is done in the browser.

### 3. Use the AI-Powered Workflow

1. **Upload Your Resume** - Upload PDF, DOCX, or JSON files. AI extracts all data automatically
2. **Add Job Description** - Paste the job posting. AI parses and uses it to tailor your CV
3. **AI Enhancement** - Watch AI rewrite and enhance your resume with metrics and achievements
4. **Select Template** - Choose from 4 beautiful templates and preview your tailored CV
5. **AI Review** - Get ATS analysis, keyword matching, and scored improvement suggestions
6. **Fix with AI** - Apply critical issues or quick wins; add context (e.g. phone number) in the dialog before confirming
7. **Download PDF** - Export your resume or cover letter as a professional, ATS-friendly PDF
8. **Generate Cover Letter** - AI creates a personalized cover letter tailored to the job

---

## 🎨 Templates

### 1. Cyber Web3 🌐
Modern web3 design with 3D floating orbs, animated grids, and morphing SVG shapes.

**Perfect for:** Blockchain developers, Web3 professionals, Tech startups

**Features:**
- 3D floating orbs with glow effects
- Animated grid background
- Morphing SVG shapes
- Gradient text effects
- Timeline-style experience

---

### 2. Neon Retro ⚡
Cyberpunk-inspired design with glowing neon effects and sharp geometric shapes.

**Perfect for:** Gaming industry, Creative developers, Cyberpunk enthusiasts

**Features:**
- Neon grid background
- Glowing borders and text
- Bold uppercase typography
- High contrast colors
- Animated pulsing lines

---

### 3. Glassmorphic 💎
Modern glass effects with gradient backgrounds and transparent overlays.

**Perfect for:** Designers, Modern tech companies, Creative professionals

**Features:**
- Backdrop blur effects
- Gradient background orbs
- Transparent floating panels
- Smooth animations
- Rounded corners

---

### 4. Minimal Pro 📄
Clean, professional typography-focused design with generous whitespace.

**Perfect for:** Corporate roles, Executive positions, Academic CVs

**Features:**
- Typography-focused
- Subtle dot pattern
- Generous whitespace
- Professional appearance
- High readability

---

## 📂 Project Structure

```
cv-generator/
├── app/
│   ├── page.tsx                    # Main page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── components/
│   ├── CVWizard.tsx                # Multi-step wizard orchestrator
│   ├── AIReviewModal.tsx           # ATS review + Fix with AI dialog
│   ├── AIModifierFloatingBar.tsx   # Natural-language CV editor
│   ├── ApiKeyInput.tsx             # API key + model settings UI
│   ├── AiModelSettings.tsx         # Flash / Pro model pickers
│   ├── CoverLetter.tsx             # Cover letter preview
│   ├── wizard/                     # Upload, enhance, template steps
│   └── cv-templates/
│       ├── CyberCV.tsx
│       ├── NeonCV.tsx
│       ├── GlassCV.tsx
│       └── MinimalCV.tsx
│
├── lib/
│   ├── aiCVExtractor.ts            # Resume extraction (Gemini 2.5 Pro)
│   ├── aiEnhancer.ts               # CV enhancement & cover letter
│   ├── aiReviewer.ts               # ATS review & scoring
│   ├── aiModifier.ts               # Modifier + Fix from review
│   ├── resumePdf.ts                # PDF export (vector, ATS-friendly)
│   ├── aiModels.ts                 # Supported model catalog & resolution
│   ├── geminiApiKey.ts             # API key normalization
│   ├── geminiRetry.ts              # Transient API error retry
│   └── jobDescriptionParser.ts     # Job posting parser
│
├── types/
│   ├── cv.ts                       # CV data types
│   ├── flow.ts                     # Wizard flow types
│   └── review.ts                   # AI review types
│
└── contexts/
    ├── AiSettingsContext.tsx       # API key + model preferences (localStorage)
    └── ApiKeyContext.tsx           # Re-exports for backward compatibility
```

---

## ✏️ Customization

### Edit Your CV Data

Modify [data/mockCV.ts](data/mockCV.ts):

```typescript
export const mockCVData: CVData = {
  personalInfo: {
    fullName: 'Your Name',
    title: 'Your Job Title',
    email: 'your@email.com',
    phone: '+1 (555) 123-4567',
    location: 'Your City',
    // ... more fields
  },
  experience: [
    {
      company: 'Your Company',
      position: 'Your Position',
      startDate: '2020-01',
      endDate: 'Present',
      description: [
        'Achievement 1',
        'Achievement 2',
      ],
      technologies: ['React', 'Node.js'],
    },
  ],
  // ... education, skills, projects, etc.
}
```

### Add New Template

1. Create [components/cv-templates/YourTemplate.tsx](components/cv-templates/YourTemplate.tsx)
2. Import in [components/TemplatePreview.tsx](components/TemplatePreview.tsx)
3. Add to templates array

---

## 🎮 Wizard Steps

The app guides you through a multi-step wizard (`CVWizard.tsx`):

| Step | What happens |
|------|----------------|
| API Key & Models | Paste Gemini key and choose flash/pro model versions |
| Upload | Upload PDF/DOCX/JSON — AI extracts your CV data |
| Job Description | Paste or parse a job posting |
| AI Enhance | Tailor and enhance your resume for the role |
| Template | Pick a template, preview, review, fix, and download PDF |

---

## 🔧 Tech Stack

- **AI Engine**: Google Gemini (only provider today) — user-selectable Gemini models (`lib/aiModels.ts`); defaults: `gemini-2.5-pro` for extraction, `gemini-2.5-flash` for enhancement/review/modify. OpenAI, Claude, and other providers: planned — see [Multi-Provider AI](#3-multi-provider-ai-support-planned)
- **PDF Export**: jsPDF vector generation (`lib/resumePdf.ts`) — selectable text, template-themed accents
- **Framework**: Next.js 16.1.1 with App Router
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: npm

---

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🎯 How It Works

### 🤖 AI-Powered Workflow

1. **Upload & Extract** - Upload multiple resume files (PDF, DOCX, JSON). AI extracts and merges all information intelligently
2. **Job-Specific Tailoring** - Provide a job description. AI rewrites your resume to match keywords and requirements
3. **Intelligent Enhancement** - AI adds metrics, achievements, and missing details based on industry standards
4. **ATS Review** - Get comprehensive scoring on job alignment, keyword optimization, and ATS compatibility
5. **Fix with AI** - Apply review feedback in a dialog; supply missing facts (phone, URL, metrics) before confirming
6. **Natural Language Editing** - Use AI Modifier to make changes with simple prompts ("Add Python to skills", "Update email")
7. **Cover Letter Generation** - AI creates personalized cover letters tailored to each job application
8. **PDF Download** - Export resume or cover letter as ATS-friendly PDF with template-matched styling
9. **Beautiful Templates** - Display your AI-enhanced CV in 4 stunning, professional templates

### 🧠 AI Capabilities

- **Deep Reasoning** - Uses Gemini 2.5 Pro for intelligent data extraction
- **Context Understanding** - Understands relationships between experiences, skills, and job requirements
- **Safe Fix from Review** - Baseline snapshot preserves original facts; user context fills gaps the AI cannot invent
- **Intelligent Merging** - Combines multiple documents without duplication
- **ATS Optimization** - Analyzes keyword matching and suggests improvements
- **Fake Data Detection** - Identifies placeholder contact info and dummy data
- **Smart Assumptions** - Fills gaps intelligently while preserving accuracy

---

## 📚 Documentation

Comprehensive documentation is available:

1. **[QUICK_START.md](QUICK_START.md)** - Get started quickly
2. **[TEMPLATES_GUIDE.md](TEMPLATES_GUIDE.md)** - Template details and customization
3. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Architecture and features
4. **[SUMMARY.md](SUMMARY.md)** - Complete project summary

---

## 🎯 Project Philosophy

This project is **AI-native first**:

1. **Intelligence Over Manual Work** - AI handles extraction, enhancement, and tailoring automatically
2. **Job-Specific Optimization** - Every CV is tailored to the specific job description using AI
3. **Privacy-First** - Your API keys stay on your device. All AI processing is transparent and auditable
4. **Context-Aware** - AI understands relationships between data points, not just pattern matching
5. **Beautiful Output** - AI-enhanced content displayed in stunning, professional templates
6. **Continuous Improvement** - AI review provides actionable feedback for ongoing optimization

---

## 🚀 Getting Started Guide

### For First-Time Users

1. **Clone and Install**
   ```bash
   git clone https://github.com/Yembot31013/cv-generator.git
   cd cv-generator
   npm install
   ```

2. **Set Up Gemini API Key**
   - Get your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Paste it in the app's API key settings (stored locally in your browser)

3. **Start the App**
   ```bash
   npm run dev
   ```

4. **Upload Your Resume**
   - Upload PDF, DOCX, or JSON files
   - AI automatically extracts all information
   - Can upload multiple files for comprehensive extraction

5. **Provide Job Description**
   - Paste the full job posting
   - AI uses it to tailor your CV specifically for that role

6. **Let AI Enhance**
   - Watch AI rewrite and enhance your resume
   - Adds metrics, achievements, and missing details
   - Tailors content to match job requirements

7. **Review & Fix**
   - Run AI Review for ATS scores and keyword analysis
   - Click **Fix with AI** → review what will change → add context for missing info → apply
   - Click **Re-analyze** to see your updated score

8. **Generate Cover Letter**
   - AI creates a personalized cover letter tailored to the job

9. **Download PDF**
   - Click **Download Resume** or **Download Cover Letter** on the template step
   - PDF uses your selected template's accent theme; text is selectable and ATS-friendly

---

## 💡 Pro Tips

1. **Upload Multiple Files**: Upload old + new resumes, portfolios, and project docs. AI merges them intelligently
2. **Detailed Job Descriptions**: The more detail you provide, the better AI can tailor your CV
3. **Use AI Review**: Run review before applying. It catches missing keywords, weak bullets, and ATS issues
4. **Fix with AI**: When review flags missing contact info or data, open the fix dialog and paste the real values before applying
5. **Re-analyze After Fixes**: Always re-analyze after Fix with AI to confirm your score improved
6. **AI Modifier**: Use natural language for one-off edits ("Add React to skills", "Update bio to focus on leadership")
7. **PDF vs Screen**: On-screen templates are rich/visual; downloaded PDFs are clean single-column layouts optimized for recruiters and ATS parsers
8. **Cover Letter**: Let AI generate it first, then use AI Modifier to refine tone or length

---

## 🎊 What's Included

### AI Features
✅ AI-powered CV extraction from PDF/DOCX/JSON
✅ Job-specific resume tailoring with Gemini 2.5 Pro
✅ Intelligent AI enhancement with metrics and achievements
✅ Comprehensive ATS review and scoring
✅ Fix with AI (scoped fixes + user context dialog)
✅ AI cover letter generation
✅ Natural language CV modification
✅ PDF download (resume + cover letter, template-themed)
✅ Multiple file merging and intelligent deduplication
✅ Fake data detection and validation
✅ Transient API error retry (503/429 backoff)

### Design & UX
✅ 4 production-ready CV templates
✅ Dark/light theme support
✅ Fully responsive design
✅ Type-safe data structure
✅ Comprehensive documentation
✅ Clean, maintainable code

---

## 🤝 Contributing

We welcome contributions! Here are areas that still need work:

### 🚀 Open Feature Requests

#### 1. **Copy Feature in Cover Letter Section** 📋
- **Status**: Cover letter preview exists but no copy-to-clipboard button
- **What's needed**:
  - Add a "Copy to Clipboard" button in the cover letter preview
  - Visual feedback on successful copy
  - Handle both plain text and formatted versions

#### 2. **More Template Designs** 🎨
- **Status**: 4 templates (Cyber, Neon, Glass, Minimal)
- **What's needed**:
  - New template components in `components/cv-templates/`
  - Register in `TemplateSelectionStep.tsx` and `lib/resumePdf.ts` theme map
  - Dark/light theme support

#### 3. **Multi-Provider AI Support** 🔌 *(planned)*
- **Status**: Gemini only — model **version** picker is shipped (`lib/aiModels.ts`, `AiModelSettings.tsx`); other providers are not yet integrated
- **Goal**: Let users choose their AI provider (Gemini, OpenAI, Anthropic Claude, etc.) and pick active model versions per task, same as today’s flash vs extraction roles
- **What's needed**:
  - Extend `AiProvider` in `lib/aiModels.ts` beyond `'gemini'` with per-provider model catalogs and `active` flags
  - Provider selector + separate API key storage in `AiSettingsContext` (browser `localStorage`, no `.env`)
  - Shared provider interface (or thin adapter layer) so `aiCVExtractor`, `aiEnhancer`, `aiReviewer`, `aiModifier`, and `jobDescriptionParser` call the selected backend
  - Client-side SDK/API clients for each provider (OpenAI, Anthropic, etc.) with the same retry/error-handling patterns as `lib/geminiRetry.ts`
  - UI updates in `ApiKeyInput` / `AiModelSettings` — provider tabs, key format hints, and role-based model dropdowns filtered to supported active models
  - Documentation and transparency notes per provider (where keys are sent, CORS/browser constraints)
- **Groundwork already in place**: `lib/aiModels.ts` role-based catalog, `resolveModelId()` migration, and `useAiSettings()` for persisted preferences

### ✅ Recently Shipped

- **AI model selection (Gemini)** — Per-task flash vs pro model pickers; only active models in UI; auto-migration when models retire
- **PDF Export** — `lib/resumePdf.ts`; download from template step with per-template accent themes
- **Fix with AI** — Review modal dialog with scoped fixes, user context input, and baseline fact preservation (`lib/aiModifier.ts`)

### 🐛 Other Contribution Areas

- **Bug Fixes**: Fix existing bugs and improve error handling
- **Improvements**: Enhance existing features and UI/UX
- **Documentation**: Improve docs, add code comments, create tutorials
- **Testing**: Add unit tests and integration tests
- **Performance**: Optimize load times and animations

---

## 📜 License

This project is licensed under a **Custom Non-Commercial Open License**.

You are free to:
- Use the software for personal or educational purposes
- Modify and self-host it
- Inspect the source code for security and transparency

You may NOT:
- Sell the software
- Offer it as a paid service (SaaS)
- Use it in a commercial product without permission

For commercial licensing inquiries, contact: yembot31013@gmail.com


---

## 🎉 Ready to Create Your AI-Enhanced CV?

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and let AI transform your resume!

**Workflow**: Upload → AI Extract → Job Description → AI Enhance → Template → AI Review → Fix with AI → Download PDF

---

## 📞 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the code comments
3. [Open an issue on GitHub](https://github.com/Yembot31013/cv-generator/issues)

---

**Made with ❤️ using Google Gemini 2.5 Pro, Next.js, React, TypeScript, and Tailwind CSS**

**Powered by AI. Designed for Success.** 🤖🚀
