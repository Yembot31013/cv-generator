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
- ✨ **AI Enhancement** - Automatically adds metrics, achievements, and missing details based on industry standards
- 📝 **AI Cover Letter Generation** - Creates personalized cover letters tailored to each job application
- 🔧 **AI Modifier** - Make instant changes with natural language prompts ("Add Python to skills", "Update email to...")
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

Users are required to provide their own AI API keys (e.g. OpenAI).
The application does **not** collect, store, or transmit API keys to any
server controlled by the author.

All AI requests are executed client-side or directly from the user's
environment. You are encouraged to review the source code to verify this.

---

## 🚀 Quick Start

### 1. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Configure AI API Key
1. Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create `.env.local` file in the root directory
3. Add: `NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here`

### 3. Use the AI-Powered Workflow
1. **Upload Your Resume** - Upload PDF, DOCX, or JSON files. AI extracts all data automatically
2. **Add Job Description** - Paste the job posting. AI uses it to tailor your CV
3. **AI Enhancement** - Watch AI rewrite and enhance your resume with metrics and achievements
4. **AI Review** - Get comprehensive ATS analysis, keyword matching, and improvement suggestions
5. **Select Template** - Choose from 4 beautiful templates to display your AI-enhanced CV
6. **Generate Cover Letter** - AI creates a personalized cover letter tailored to the job

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
│   ├── TemplatePreview.tsx         # Preview system
│   └── cv-templates/
│       ├── CyberCV.tsx            # Cyber Web3
│       ├── NeonCV.tsx             # Neon Retro
│       ├── GlassCV.tsx            # Glassmorphic
│       └── MinimalCV.tsx          # Minimal Pro
│
├── types/
│   └── cv.ts                       # TypeScript types
│
├── data/
│   └── mockCV.ts                   # Sample data
│
└── docs/                           # Documentation
    ├── QUICK_START.md
    ├── TEMPLATES_GUIDE.md
    ├── PROJECT_OVERVIEW.md
    └── SUMMARY.md
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

## 🎮 Control Panel

Located at the top of the page:

| Button | Function |
|--------|----------|
| ☀️ / 🌙 | Toggle theme (dark/light) |
| ← Previous | Go to previous template |
| Next → | Go to next template |
| Request Changes | Submit feedback |
| ✓ Approve | Approve current template |

**Template Dots**: Click dots at bottom to jump to any template

---

## 🔧 Tech Stack

- **AI Engine**: Google Gemini 2.5 Pro with Thinking Mode
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
5. **Natural Language Editing** - Use AI Modifier to make changes with simple prompts ("Add Python to skills", "Update email")
6. **Cover Letter Generation** - AI creates personalized cover letters tailored to each job application
7. **Beautiful Templates** - Display your AI-enhanced CV in 4 stunning, professional templates

### 🧠 AI Capabilities

- **Deep Reasoning** - Uses Gemini 2.5 Pro Thinking Mode for intelligent data extraction
- **Context Understanding** - Understands relationships between experiences, skills, and job requirements
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

2. **Set Up AI API Key**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create `.env.local` file: `NEXT_PUBLIC_GEMINI_API_KEY=your_key_here`

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

7. **Review & Improve**
   - Get AI-powered ATS analysis
   - See keyword matching and improvement suggestions
   - Use AI Modifier for instant changes

8. **Generate Cover Letter**
   - AI creates personalized cover letter
   - Tailored to the specific job and your experience

9. **Choose Template & Export**
   - Select from 4 beautiful templates
   - Export your AI-enhanced CV

---

## 💡 Pro Tips

1. **Upload Multiple Files**: Upload old + new resumes, portfolios, and project docs. AI merges them intelligently
2. **Detailed Job Descriptions**: The more detail you provide, the better AI can tailor your CV
3. **Use AI Review**: Always run AI review before submitting. It catches fake data, missing keywords, and ATS issues
4. **AI Modifier**: Use natural language to make changes ("Add React to skills", "Update bio to focus on leadership")
5. **Re-analyze After Changes**: Use re-analysis feature to see how improvements affect your score
6. **Cover Letter**: Let AI generate it first, then use AI Modifier to refine tone or length

---

## 🎊 What's Included

### AI Features
✅ AI-powered CV extraction from PDF/DOCX/JSON
✅ Job-specific resume tailoring with Gemini 2.5 Pro
✅ Intelligent AI enhancement with metrics and achievements
✅ Comprehensive ATS review and scoring
✅ AI cover letter generation
✅ Natural language CV modification
✅ Multiple file merging and intelligent deduplication
✅ Fake data detection and validation

### Design & UX
✅ 4 production-ready CV templates
✅ Dark/light theme support
✅ Fully responsive design
✅ Type-safe data structure
✅ Comprehensive documentation
✅ Clean, maintainable code

---

## 🤝 Contributing

We welcome contributions! Here are specific features that are **coming soon** and need implementation:

### 🚀 Coming Soon Features

#### 1. **PDF Export/Download** 📄
- **Status**: Partially implemented (code exists in `lib/pdfExport.ts`) but UI shows "coming soon"
- **What's needed**: 
  - Connect the export function to the download button in `TemplateSelectionStep.tsx`
  - Replace the alert message with actual PDF download functionality
  - Test PDF generation with all 4 templates
  - Ensure proper formatting and page breaks

#### 2. **Copy Feature in Cover Letter Section** 📋
- **Status**: Cover letter component exists but no copy button
- **What's needed**:
  - Add a "Copy to Clipboard" button in the cover letter preview
  - Implement copy functionality that copies the formatted cover letter text
  - Add visual feedback when copy is successful
  - Handle both plain text and formatted versions

#### 3. **Auto Fix in AI Review** ✨
- **Status**: "Fix with AI" button exists but shows "coming soon" alert
- **What's needed**:
  - Implement auto-fix functionality in `AIReviewModal.tsx`
  - Connect to AI modifier to automatically apply suggested improvements
  - Allow users to fix critical issues, quick wins, or specific sections
  - Show before/after comparison
  - Apply fixes to both resume and cover letter

#### 4. **More Template Designs** 🎨
- **Status**: Currently 4 templates (Cyber, Neon, Glass, Minimal)
- **What's needed**:
  - Create new template components in `components/cv-templates/`
  - Add to template selection in `TemplateSelectionStep.tsx`
  - Ensure dark/light theme support
  - Follow existing template structure and TypeScript types
  - Ideas: Corporate Classic, Creative Portfolio, Academic, Modern Minimal, etc.

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

**Workflow**: Upload → AI Extract → Job Description → AI Enhance → AI Review → Template → Cover Letter → Export

---

## 📞 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the code comments
3. [Open an issue on GitHub](https://github.com/Yembot31013/cv-generator/issues)

---

**Made with ❤️ using Google Gemini 2.5 Pro, Next.js, React, TypeScript, and Tailwind CSS**

**Powered by AI. Designed for Success.** 🤖🚀
