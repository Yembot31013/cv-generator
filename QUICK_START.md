# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Navigate Templates
- **Previous/Next buttons**: Switch between 4 stunning templates
- **Theme toggle**: Switch between dark/light mode (dark is default)
- **Template dots**: Click to jump to specific templates

### 3. Review & Approve
- **Approve Design**: Click when you love a template
- **Request Changes**: Submit feedback for modifications

---

## 📁 Project Files

### Key Files You'll Use

```
data/mockCV.ts              ← Edit this to customize your CV data
components/cv-templates/    ← All template designs are here
  ├── CyberCV.tsx          ← Web3 cyber theme with 3D effects
  ├── NeonCV.tsx           ← Cyberpunk neon theme
  ├── GlassCV.tsx          ← Glassmorphic modern theme
  └── MinimalCV.tsx        ← Professional minimal theme
```

---

## ✏️ Customize Your CV Data

Edit [data/mockCV.ts](data/mockCV.ts) to add your information:

```typescript
export const mockCVData: CVData = {
  personalInfo: {
    fullName: 'Your Name',           // ← Change this
    title: 'Your Job Title',         // ← Change this
    email: 'your@email.com',         // ← Change this
    // ... etc
  },
  experience: [
    {
      company: 'Your Company',       // ← Add your experience
      position: 'Your Position',
      // ... etc
    }
  ],
  // ... add your projects, education, skills
}
```

---

## 🎨 Available Templates

### 1. Cyber Web3 🌐
- 3D effects with floating orbs
- Animated grid background
- Perfect for: Tech/Blockchain roles

### 2. Neon Retro ⚡
- Cyberpunk neon glow effects
- Bold geometric design
- Perfect for: Creative/Gaming roles

### 3. Glassmorphic 💎
- Modern glass effects
- Gradient backgrounds
- Perfect for: Design/Modern tech roles

### 4. Minimal Pro 📄
- Clean, professional typography
- Traditional layout
- Perfect for: Corporate/Executive roles

---

## 🎯 Common Tasks

### Change CV Data
1. Open `data/mockCV.ts`
2. Edit the values
3. Save (auto-reloads)

### Add a New Template
1. Create `components/cv-templates/MyTemplate.tsx`
2. Copy structure from existing template
3. Add to `components/TemplatePreview.tsx`

### Change Default Theme
In `components/TemplatePreview.tsx`:
```tsx
const [theme, setTheme] = useState<'dark' | 'light'>('dark'); // ← Change 'dark' to 'light'
```

### Modify Template Colors
Each template uses Tailwind classes:
```tsx
className="text-indigo-500"  // ← Change indigo to another color
```

---

## 🎨 Theme Toggle

All templates support both themes:
- **Dark Mode** (default): Better for screens, shows effects beautifully
- **Light Mode**: Better for printing, professional look

Toggle anytime using the theme button in the control panel.

---

## 📱 Responsive Design

All templates automatically adapt to:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop screens
- 🖥️ Large monitors

---

## 🎬 Control Panel Features

Located at the top of the page:

| Button | Action |
|--------|--------|
| ☀️/🌙 | Toggle dark/light mode |
| ← Previous | Go to previous template |
| Next → | Go to next template |
| Request Changes | Submit feedback |
| ✓ Approve Design | Approve current template |

### Template Dots
- Bottom center of the screen
- Click any dot to jump to that template
- Active template is highlighted

---

## 💡 Pro Tips

1. **Start with Dark Mode**: Templates look most impressive in dark mode
2. **Try All Templates**: Each has a unique style, view all before deciding
3. **Check Both Themes**: Some templates look very different in light mode
4. **Test on Your Device**: View on the device you'll use most
5. **Customize the Data**: Use your real data to see how it looks

---

## 🐛 Troubleshooting

### Dev server won't start
```bash
# Kill any process on port 3000
npx kill-port 3000

# Then try again
npm run dev
```

### Changes not showing
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Restart dev server

### TypeScript errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learn More

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Detailed project documentation
- [TEMPLATES_GUIDE.md](TEMPLATES_GUIDE.md) - Template design guide
- [types/cv.ts](types/cv.ts) - Data structure reference

---

## 🎯 Next Steps

1. **Customize your data** in `data/mockCV.ts`
2. **Review all templates** to find your favorite
3. **Try both themes** (dark and light)
4. **Approve a template** when you're happy
5. **Request changes** if you want modifications

---

## 🎨 Design Philosophy

This project focuses on:
- **Visual Impact**: Eye-catching designs that stand out
- **Web3 Aesthetics**: Modern, futuristic styling
- **3D Effects**: Depth and dimension using SVG and CSS
- **Dark Theme First**: Optimized for dark mode viewing
- **Clean UI**: Despite effects, information is clear and readable

---

## 🚀 Ready to Go!

You now have:
- ✅ 4 stunning CV templates
- ✅ Complete mock data for testing
- ✅ Dark/light theme support
- ✅ Preview and approval system
- ✅ Fully responsive design
- ✅ 3D effects and animations

**Start the dev server and enjoy exploring your templates!**

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)
