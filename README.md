# ✨ Stunning CV Generator

> A modern CV generator with beautiful Web3-inspired templates featuring 3D effects, glassmorphism, and neon designs.

[![GitHub](https://img.shields.io/badge/GitHub-Yembot31013%2Fcv--generator-181717?style=for-the-badge&logo=github)](https://github.com/Yembot31013/cv-generator)
[![License](https://img.shields.io/badge/License-Non--Commercial-red?style=for-the-badge)](LICENSE)

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🎯 Features

- ✨ **4 Stunning Templates** - Cyber Web3, Neon Retro, Glassmorphic, Minimal Pro
- 🌓 **Dark/Light Themes** - Optimized for both modes (dark default)
- 🎨 **3D Effects** - SVG animations and depth effects
- 💎 **Glassmorphism** - Modern glass effects with backdrop blur
- ⚡ **Neon Glow** - Cyberpunk-inspired neon effects
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚛️ **Type-Safe** - Complete TypeScript support
- 🎬 **Smooth Animations** - Hardware-accelerated transitions
- ✅ **Approval Workflow** - Preview and approve designs
- 📄 **Mock Data Included** - Ready to test immediately

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

### 2. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### 3. Start Exploring!
Use the control panel to:
- Navigate between templates
- Toggle dark/light mode
- Approve or request changes

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

- **Framework**: Next.js 16.1.1 with App Router
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: CSS + SVG
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

## 🎯 Key Features

### 🎨 Visual Design
- Web3-inspired aesthetics
- 3D depth and dimension
- Smooth animations
- Modern color schemes
- Clean, readable layouts

### 💻 Technical
- Type-safe with TypeScript
- Component-based architecture
- Responsive design
- Performance optimized
- Easy to customize

### 📱 User Experience
- Intuitive navigation
- Theme toggle
- Approval workflow
- Feedback system
- Template previews

---

## 📚 Documentation

Comprehensive documentation is available:

1. **[QUICK_START.md](QUICK_START.md)** - Get started quickly
2. **[TEMPLATES_GUIDE.md](TEMPLATES_GUIDE.md)** - Template details and customization
3. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Architecture and features
4. **[SUMMARY.md](SUMMARY.md)** - Complete project summary

---

## 🎨 Design Philosophy

This project focuses on:

1. **Visual Impact** - Eye-catching designs that stand out
2. **Web3 Aesthetics** - Modern, futuristic styling
3. **3D Effects** - Depth and dimension using SVG and CSS
4. **Dark Theme First** - Optimized for dark mode viewing
5. **Clean UI** - Beautiful yet readable and professional
6. **Performance** - Smooth, hardware-accelerated animations

---

## 🚀 Getting Started Guide

### For First-Time Users

1. **Clone and Install**
   ```bash
   git clone https://github.com/Yembot31013/cv-generator.git
   cd cv-generator
   npm install
   ```

2. **Add Your Data**
   - Open [data/mockCV.ts](data/mockCV.ts)
   - Replace with your information
   - Save the file

3. **Start the App**
   ```bash
   npm run dev
   ```

4. **Browse Templates**
   - View all 4 templates
   - Try dark and light modes
   - Find your favorite

5. **Approve or Customize**
   - Approve a template you love
   - Or request modifications

---

## 💡 Pro Tips

1. **Dark Mode First**: Templates look most impressive in dark mode
2. **Try All Templates**: Each has a unique personality
3. **Test Both Themes**: Some templates transform in light mode
4. **Use Real Data**: Test with your actual CV data
5. **Mobile Check**: View on different screen sizes

---

## 🎊 What's Included

✅ 4 production-ready CV templates
✅ Complete preview system
✅ Dark/light theme support
✅ Approval workflow
✅ Type-safe data structure
✅ Mock data for testing
✅ Comprehensive documentation
✅ Responsive design
✅ Smooth animations
✅ 3D effects with SVG
✅ Clean, maintainable code

---

## 🤝 Contributing

Feel free to:
- Add new templates
- Improve existing designs
- Add features
- Fix bugs
- Improve documentation

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

## 🎉 Ready to Create Your Stunning CV?

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start exploring!

---

## 📞 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the code comments
3. [Open an issue on GitHub](https://github.com/Yembot31013/cv-generator/issues)

---

**Made with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**

**Enjoy creating stunning CVs!** 🎨🚀
