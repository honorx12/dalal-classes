# Design Spec: 90fps Smooth Performance & Visual Overhaul

**Date:** 2025-07-28  
**Approach:** B - Moderate Visual + Performance Overhaul  
**Status:** Approved for Implementation

---

## Overview

Transform Dalal Classes from a laggy, heavy-animation site to a buttery-smooth, "90fps" experience with gaming-grade polish while maintaining brand identity.

---

## Current Problems Identified

1. **WebGL LiquidChrome** - Full-screen canvas running JS animation loop on every frame
2. **Heavy Framer Motion scroll animations** - `useScroll` + `useTransform` causing layout thrashing
3. **React state-driven SVG animations** - `setInterval` triggering re-renders
4. **No passive event listeners** - Blocking scroll handlers
5. **Animation durations too slow** - 500ms feels sluggish, not snappy
6. **Glassmorphism blur values too low** - Looks cheap at 12px

---

## Design Decisions

### 1. WebGL LiquidChrome → CSS Mesh Gradient

**Current:** Canvas-based WebGL with per-frame shader calculations

**New:** Pure CSS using `conic-gradient` with `@keyframes` animation

```css
/* GPU-accelerated, no JS required */
.mesh-gradient {
  background: 
    radial-gradient(at 40% 20%, hsla(270,100%,50%,1) 0, transparent 50%),
    radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0, transparent 50%),
    radial-gradient(at 0% 50%, hsla(340,100%,76%,1) 0, transparent 50%),
    radial-gradient(at 80% 50%, hsla(270,100%,50%,1) 0, transparent 50%),
    radial-gradient(at 0% 100%, hsla(189,100%,56%,1) 0, transparent 50%),
    radial-gradient(at 80% 100%, hsla(340,100%,76%,1) 0, transparent 50%),
    radial-gradient(at 0% 0%, hsla(270,100%,50%,1) 0, transparent 50%);
  animation: meshShift 20s ease-in-out infinite;
}
```

**Why:** 60fps guaranteed, zero CPU usage, works on all devices

### 2. Scroll Animations → IntersectionObserver + CSS

**Current:** Framer Motion `useScroll` hook tracking scroll position

**New:** IntersectionObserver triggers CSS animation classes

```javascript
// Observer triggers once, CSS handles the rest
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, { threshold: 0.1 });
```

**Why:** No React re-renders on scroll, GPU-accelerated CSS transforms only

### 3. CourseStructureGraph SVG → CSS @keyframes

**Current:** React state + setInterval updating stroke positions

**New:** Pure CSS `stroke-dashoffset` animation

```css
.path-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease-out forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

**Why:** No JavaScript overhead, GPU-accelerated path rendering

### 4. Animation Timing Overhaul

| Animation Type | Current | New | Easing |
|----------------|---------|-----|--------|
| Hover effects | 300-500ms | 150-250ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Page transitions | 400ms | 250ms | `cubic-bezier(0.33, 1, 0.68, 1)` |
| Scroll reveals | 600ms | 400ms | `cubic-bezier(0.21, 0.47, 0.32, 0.98)` |
| Button clicks | instant | 100ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

**Why:** Snappier feel, gaming-grade responsiveness

### 5. Visual Polish Specs

**Dark Mode Enhancement:**
- Base: `#0A0A0F` (deeper black)
- Elevated: `#121218` (slightly lifted)
- Surface: `#1A1A22` (card backgrounds)

**Glassmorphism:**
- Backdrop blur: 12px → 20px
- Background opacity: 0.7 → 0.85
- Border: 1px solid rgba(255,255,255,0.08)

**Accent Glows:**
- Brand glow: `0 0 40px rgba(124, 58, 237, 0.3)`
- Cyan glow: `0 0 40px rgba(6, 182, 212, 0.25)`
- Fuchsia glow: `0 0 40px rgba(217, 70, 239, 0.25)`

**Micro-interactions:**
- Button hover: `transform: translateY(-2px) scale(1.02)`
- Button active: `transform: scale(0.98)`
- Card hover: `transform: translateY(-4px) rotateX(2deg)`

---

## File Changes

### High Priority (Performance Critical)

1. `src/components/LiquidChrome.jsx` - Replace WebGL with CSS
2. `src/lib/motion.jsx` - Optimize animation variants, add passive listeners
3. `src/index.css` - Add mesh gradient animations, timing variables
4. `src/pages/HomePage.jsx` - Optimize CourseStructureGraph

### Medium Priority (Visual Polish)

5. `tailwind.config.js` - Update blur values, add custom animations
6. `src/components/marketing/HeroBackdrop.jsx` - Simplify layers
7. `src/components/Navbar.jsx` - Add passive scroll listener
8. All component CSS classes - Update glassmorphism values

---

## Success Metrics

- [ ] Lighthouse Performance score: 60+ → 85+
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3.5s
- [ ] Animation frame rate: Consistent 60fps on scroll
- [ ] Visual feedback: "feels snappier" on user testing

---

## Risk Mitigation

1. **Reduced motion preference** - All animations respect `prefers-reduced-motion`
2. **Browser compatibility** - CSS mesh gradient has fallbacks
3. **Mobile performance** - Touch-optimized interactions, no hover effects

---

## Implementation Order

1. CSS foundation (index.css, tailwind config)
2. LiquidChrome replacement
3. Motion library optimization
4. HomePage component fixes
5. Global component polish pass
6. Performance testing & validation

---

**Approved by:** User  
**Ready for implementation:** YES
