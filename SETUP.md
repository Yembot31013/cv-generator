# Setup Guide - CV Generator

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install all required packages
yarn add react-pdf @react-pdf/renderer mammoth @google/generative-ai html2canvas jspdf
```

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

**Important**:
- Don't commit `.env.local` to git (it's already in `.gitignore`)
- Replace `your_actual_api_key_here` with your real API key

### 4. Start the Development Server

```bash
yarn dev
```

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

---

## 📦 Dependencies Explained

### Core Dependencies

| Package | Purpose |
|---------|---------|
| `@google/generative-ai` | Google Gemini AI for CV enhancement |
| `html2canvas` | Convert HTML to canvas for PDF |
| `jspdf` | Generate PDF files |
| `mammoth` | Parse DOCX files (optional) |

### Already Installed

- `next` - Framework
- `react` - UI library
- `tailwindcss` - Styling
- `typescript` - Type safety

---

## ⚙️ Configuration

### Environment Variables

Only one environment variable is required:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

**Why NEXT_PUBLIC_?**
- This prefix makes the variable available in client-side code
- Needed because AI calls happen in the browser
- Safe because it's a restricted API key

### API Key Security

**Best Practices**:
1. Never commit API keys to git
2. Use restricted keys (limit to your domain)
3. Monitor usage in Google AI Studio
4. Rotate keys periodically

**Google AI Studio Settings**:
- Set application restrictions
- Add allowed domains
- Enable API usage monitoring
- Set quota limits

---

## 🔧 Troubleshooting

### Issue: "Gemini API key not found"

**Solution**:
1. Check `.env.local` exists in project root
2. Verify variable name is exactly `NEXT_PUBLIC_GEMINI_API_KEY`
3. Restart development server after creating `.env.local`
4. Clear browser cache

```bash
# Restart server
yarn dev
```

### Issue: "Failed to enhance CV with AI"

**Possible Causes**:
1. Invalid API key
2. Quota exceeded
3. Network issues
4. API temporary unavailable

**Solutions**:
1. Verify API key in Google AI Studio
2. Check quota limits
3. Check internet connection
4. Wait a few minutes and try again

### Issue: PDF Export Fails

**Solutions**:
1. Use browser print (Ctrl/Cmd + P)
2. Try different browser (Chrome recommended)
3. Disable browser extensions
4. Check console for specific errors

### Issue: TypeScript Errors

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules .next
yarn install
yarn dev
```

### Issue: Module Not Found

**Solution**:
```bash
# Verify all packages installed
yarn install

# Check package.json for missing dependencies
cat package.json
```

---

## 🌍 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add `NEXT_PUBLIC_GEMINI_API_KEY`
   - Set value to your API key
   - Save changes

4. **Deploy**:
   - Vercel automatically deploys
   - Visit your live site!

### Deploy to Netlify

1. **Build Command**: `yarn build`
2. **Publish Directory**: `.next`
3. **Add environment variables** in site settings

### Deploy to Other Platforms

Works with any platform supporting Next.js:
- AWS Amplify
- Google Cloud Run
- DigitalOcean App Platform
- Render

---

## 📁 File Structure Overview

```
cv-generator/
├── app/
│   ├── page.tsx              # Main entry point (wizard)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/
│   ├── CVWizard.tsx          # Main wizard orchestrator
│   ├── TemplatePreview.tsx   # Original template preview
│   ├── cv-templates/         # CV templates
│   │   ├── CyberCV.tsx
│   │   ├── NeonCV.tsx
│   │   ├── GlassCV.tsx
│   │   └── MinimalCV.tsx
│   └── wizard/               # Wizard steps
│       ├── UploadStep.tsx
│       ├── JobDescriptionStep.tsx
│       ├── AIEnhancementStep.tsx
│       └── TemplateSelectionStep.tsx
│
├── lib/
│   ├── linkedinExtractor.ts  # Parse LinkedIn data
│   ├── aiEnhancer.ts         # AI enhancement logic
│   └── pdfExport.ts          # PDF export utilities
│
├── types/
│   ├── cv.ts                 # CV data types
│   └── flow.ts               # Flow types
│
├── data/
│   └── mockCV.ts             # Sample data
│
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment template
└── package.json             # Dependencies
```

---

## 🧪 Testing

### Test the Upload Flow

1. Start the app
2. Click "Skip (Manual Entry)" on upload
3. Skip job description
4. Watch AI quick format
5. Select template
6. Download PDF

### Test with LinkedIn Data

1. Export your LinkedIn profile:
   - LinkedIn → Settings → Data Privacy
   - "Get a copy of your data"
   - Select "Profile"
   - Download JSON

2. Upload the JSON file
3. Paste a real job description
4. Let AI enhance
5. Download PDF

### Test AI Enhancement

1. Use minimal data
2. Provide detailed job description
3. Observe AI filling gaps
4. Check enhanced content quality

### Test PDF Export

1. Try all 4 templates
2. Test dark and light modes
3. Verify PDF quality
4. Check file downloads correctly

---

## 💻 Development Workflow

### Local Development

```bash
# Start development server
yarn dev

# Run linter
yarn lint

# Build for production
yarn build

# Start production server
yarn start
```

### Adding New Features

1. **New Template**:
   - Create in `components/cv-templates/`
   - Add to template array in `TemplateSelectionStep.tsx`

2. **Modify AI Prompts**:
   - Edit `lib/aiEnhancer.ts`
   - Test thoroughly with different inputs

3. **New Wizard Step**:
   - Create in `components/wizard/`
   - Add to `CVWizard.tsx` flow

### Code Quality

```bash
# Format code
yarn prettier --write .

# Type check
yarn tsc --noEmit

# Lint
yarn lint
```

---

## 📚 Additional Resources

### Documentation
- [FLOW_GUIDE.md](FLOW_GUIDE.md) - Complete user flow
- [TEMPLATES_GUIDE.md](TEMPLATES_GUIDE.md) - Template documentation
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project details

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## ✅ Setup Checklist

- [ ] Cloned repository
- [ ] Ran `yarn install`
- [ ] Installed additional packages
- [ ] Created `.env.local` file
- [ ] Added Gemini API key
- [ ] Started dev server
- [ ] Opened in browser
- [ ] Tested upload flow
- [ ] Tested AI enhancement
- [ ] Downloaded sample PDF

---

## 🎉 You're Ready!

If you've completed the setup checklist, you're all set to:

1. ✅ Upload LinkedIn resumes
2. ✅ Tailor CVs with AI
3. ✅ Generate beautiful PDFs
4. ✅ Deploy to production

**Need help?** Check:
- [FLOW_GUIDE.md](FLOW_GUIDE.md) for user flow details
- [TEMPLATES_GUIDE.md](TEMPLATES_GUIDE.md) for template info
- Console logs for errors
- Google AI Studio for API issues

**Happy CV creating!** 🚀📄
