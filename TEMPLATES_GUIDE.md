# CV Templates Guide

## Available Templates

### 1. Cyber Web3 Template 🌐
**File**: `components/cv-templates/CyberCV.tsx`

**Design Features**:
- Animated grid background with perspective effect
- Floating 3D orbs with glow filters
- Gradient text with indigo, purple, and pink colors
- Morphing SVG shapes
- Glassmorphic cards with depth shadows
- Timeline-style experience section with animated dots

**Best For**: Tech professionals, blockchain developers, web3 enthusiasts

**Color Scheme**:
- Dark: Deep blue-black backgrounds (#0a0b0d, #1a1b26)
- Accents: Indigo (#6366f1), Purple (#8b5cf6), Pink (#ec4899)
- Light: White/gray backgrounds with same accent colors

---

### 2. Neon Retro Template ⚡
**File**: `components/cv-templates/NeonCV.tsx`

**Design Features**:
- Neon grid background (cyberpunk aesthetic)
- Glowing borders and text effects
- Sharp geometric design with corner brackets
- Bold uppercase typography
- High contrast color scheme
- Pulsing animated lines

**Best For**: Creative developers, designers, gaming industry, cyberpunk enthusiasts

**Color Scheme**:
- Dark: Pure black background
- Accents: Cyan (#00ffff), Magenta (#ff00ff), Yellow (#ffff00)
- Strong neon glow effects
- Light: Softer versions of neon colors

---

### 3. Glassmorphic Template 💎
**File**: `components/cv-templates/GlassCV.tsx`

**Design Features**:
- Backdrop blur effects (glassmorphism)
- Gradient background orbs
- Floating glass panels with transparency
- Smooth animations and transitions
- Modern rounded corners
- Subtle shadow effects

**Best For**: Designers, modern tech companies, creative professionals

**Color Scheme**:
- Dark: Gradient from indigo to purple to pink
- Glass: White/transparent overlays
- Light: Pastel gradients (blue, purple, pink)

---

### 4. Minimal Pro Template 📄
**File**: `components/cv-templates/MinimalCV.tsx`

**Design Features**:
- Clean typography-focused design
- Minimal use of colors
- Subtle dot pattern background
- Generous whitespace
- Traditional CV layout
- Professional and elegant

**Best For**: Corporate positions, traditional industries, executive roles, academic positions

**Color Scheme**:
- Dark: Dark gray background (#0d1117)
- Accents: Subtle indigo
- Light: Off-white with gray text
- Focus on readability over decoration

---

## Template Structure

All templates follow the same props interface:

```tsx
interface CVTemplateProps {
  data: CVData;        // The CV data
  theme?: 'dark' | 'light';  // Theme mode
}
```

### Common Sections

Each template includes these sections:
1. **Header**: Name, title, contact info, social links
2. **About**: Bio/summary
3. **Experience**: Work history with descriptions
4. **Projects**: Featured projects with highlights
5. **Education**: Academic background
6. **Skills**: Categorized skills
7. **Certifications**: Professional certifications (optional)
8. **Languages**: Language proficiencies (optional)

---

## Customization Tips

### Adding Your Own Style

1. **Colors**: Update the color classes (e.g., `bg-indigo-500` to `bg-blue-500`)
2. **Fonts**: Add custom fonts in `app/layout.tsx`
3. **Animations**: Modify the `<style jsx>` sections
4. **Layout**: Adjust grid columns and spacing

### Animation Customization

Each template has unique animations:

**Cyber Web3**:
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}
```

**Neon Retro**:
- Uses `animate-pulse` for neon effects
- Box shadows for glow

**Glassmorphic**:
- `backdrop-blur-2xl` for glass effect
- Gradient backgrounds

**Minimal**:
- Subtle hover effects
- Focus on typography

---

## Theme Support

All templates support both dark and light modes:

```tsx
const isDark = theme === 'dark';
```

### Dark Mode (Default)
- Optimized for viewing
- Reduces eye strain
- Better for screens
- Shows off effects better

### Light Mode
- Better for printing
- Professional appearance
- Easier to read in bright environments

---

## Performance Notes

- **SVG Animations**: Hardware-accelerated, smooth performance
- **CSS Transitions**: Use `transition-all` for smooth state changes
- **Backdrop Blur**: May impact performance on older devices
- **Gradients**: Optimized with `bg-gradient-to-*` utilities

---

## Responsive Design

All templates are responsive:
- Mobile: Single column layout
- Tablet: Adjusted spacing
- Desktop: Full grid layouts

Key breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

---

## Adding a New Template

1. Create a new file in `components/cv-templates/YourTemplate.tsx`
2. Import the types: `import { CVTemplateProps } from '@/types/cv';`
3. Implement the component using the same data structure
4. Add to `components/TemplatePreview.tsx`:
   ```tsx
   import YourTemplate from './cv-templates/YourTemplate';

   const templates = [
     // ... existing
     { id: 'your-template', name: 'Your Name', component: YourTemplate },
   ];
   ```

---

## Best Practices

1. **Use the mock data**: Test with `data/mockCV.ts` first
2. **Support both themes**: Implement dark and light mode
3. **Keep it accessible**: Maintain good contrast ratios
4. **Test responsiveness**: Check on mobile, tablet, desktop
5. **Optimize images**: Use Next.js Image component if adding images
6. **Clean code**: Follow the existing component patterns

---

## Tips for Stunning Designs

1. **Contrast**: Ensure text is readable on all backgrounds
2. **Spacing**: Use generous padding and margins
3. **Typography**: Vary font sizes to create hierarchy
4. **Colors**: Limit to 3-4 main colors
5. **Animations**: Keep them subtle and purposeful
6. **Consistency**: Maintain design language throughout
7. **Performance**: Test on lower-end devices

---

## Common Issues

### Text not visible
- Check color contrast
- Verify theme conditionals (`isDark`)

### Animations choppy
- Use CSS transforms instead of position changes
- Apply `will-change` for heavy animations

### Layout breaks on mobile
- Use `flex-wrap` and responsive grids
- Test with browser dev tools

### Colors not matching
- Verify Tailwind class names
- Check theme configuration
