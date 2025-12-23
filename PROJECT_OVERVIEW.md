# CV Generator System

A stunning CV generator with beautiful Web3-inspired templates featuring 3D effects, glassmorphism, and neon designs.

## Features

- **Multiple Stunning Templates**
  - Cyber Web3: Modern web3 design with 3D elements and floating orbs
  - Neon Retro: Cyberpunk-inspired neon design with glowing effects
  - Glassmorphic: Beautiful glassmorphism with gradient backgrounds

- **Theme Support**
  - Dark mode (default)
  - Light mode
  - Easy theme toggle

- **Review System**
  - View templates with navigation
  - Approve designs
  - Request changes with feedback
  - Smooth transitions between templates

- **Mock Data**
  - Comprehensive CV data structure
  - Ready-to-use sample data
  - Easy to customize

## Project Structure

```
├── app/
│   ├── page.tsx              # Main page with template preview
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── TemplatePreview.tsx   # Preview interface with controls
│   └── cv-templates/         # CV template components
│       ├── CyberCV.tsx       # Web3 cyber theme
│       ├── NeonCV.tsx        # Neon retro theme
│       └── GlassCV.tsx       # Glassmorphic theme
├── types/
│   └── cv.ts                 # TypeScript type definitions
└── data/
    └── mockCV.ts             # Sample CV data for testing
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Using the System

### Navigation Controls
- **Previous/Next**: Switch between templates
- **Theme Toggle**: Switch between dark and light modes
- **Approve Design**: Approve the current template
- **Request Changes**: Submit feedback for modifications

### Template Dots
- Click on the dots at the bottom to jump to specific templates
- Current template is highlighted

## Customizing Templates

### Adding a New Template

1. Create a new component in `components/cv-templates/`:
   ```tsx
   import { CVTemplateProps } from '@/types/cv';

   export default function MyTemplate({ data, theme }: CVTemplateProps) {
     // Your template implementation
   }
   ```

2. Import and add to `components/TemplatePreview.tsx`:
   ```tsx
   import MyTemplate from './cv-templates/MyTemplate';

   const templates = [
     // ... existing templates
     { id: 'my-template', name: 'My Template', component: MyTemplate },
   ];
   ```

### Customizing Data

Edit `data/mockCV.ts` to customize the CV data:
- Personal information
- Work experience
- Education
- Skills
- Projects
- Certifications
- Languages

## Technologies Used

- **Next.js 16.1.1**: React framework with App Router
- **React 19.2.3**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **SVG**: 3D effects and animations

## Design Features

### Cyber Web3 Template
- Animated grid background
- Floating 3D orbs with glow effects
- Gradient text effects
- Morphing SVG shapes
- Card-based layout with depth

### Neon Retro Template
- Neon grid background
- Glowing borders and text
- Cyberpunk color scheme (cyan, pink, yellow)
- Sharp geometric design
- Animated neon lines

### Glassmorphic Template
- Backdrop blur effects
- Gradient backgrounds
- Floating glass panels
- Smooth animations
- Modern minimalist design

## Tips for Best Results

1. **Dark Mode Default**: Templates are optimized for dark mode
2. **High Resolution**: View on high-resolution displays for best effect
3. **Modern Browsers**: Use latest Chrome, Firefox, or Edge for full effects
4. **Performance**: Animations use CSS and SVG for optimal performance

## Next Steps

1. Add more templates with different styles
2. Implement PDF export functionality
3. Add data input forms
4. Create template customization options
5. Add animation preferences
6. Implement save/load functionality
