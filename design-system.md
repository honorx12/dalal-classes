# Dalal Classes Design System

## Overview
A modern, professional educational platform with a dark-first aesthetic featuring vibrant gradients, glassmorphism effects, and smooth micro-interactions. Built for accessibility and engagement.

## Design Philosophy
- **Approach**: Dark-first modern minimalism with vibrant accents
- **Personality**: Professional, trustworthy, innovative, accessible
- **Visual Language**: Clean lines, subtle depth, purposeful motion

## Color Palette

### Primary Colors (Indigo + Cyan)
- Primary Indigo: `#4F46E5` (--color-primary)
- Primary Cyan: `#06B6D4` (--color-accent-cyan)
- On Primary: `#FFFFFF`

### Semantic Colors
- Background: `#0F172A` (--color-bg) - Deep slate
- Background Elevated: `#1E293B` (--color-card) - Card surfaces
- Foreground: `#F8FAFC` (--color-text) - Primary text
- Muted: `#64748B` (--color-muted) - Secondary text
- Border: `rgba(255,255,255,0.08)` (--color-border) - Subtle borders

### Accent Colors
- Success: `#10B981` (--color-success) - Green for success states
- Warning: `#F59E0B` (--color-warning) - Amber for warnings
- Error: `#EF4444` (--color-error) - Red for errors
- Info: `#3B82F6` (--color-info) - Blue for info

### Gradient Definitions
- Primary Gradient: `linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)`
- Success Gradient: `linear-gradient(135deg, #10B981 0%, #34D399 100%)`
- Glow Effect: `0 0 40px rgba(79, 70, 229, 0.3)`

## Typography

### Font Families
- **Primary**: Inter, system-ui, sans-serif
- **Display**: Inter with tighter tracking for headlines
- **Monospace**: JetBrains Mono for code (optional)

### Font Loading
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| text-xs | 0.75rem (12px) | 1.5 | 400 | Captions, metadata |
| text-sm | 0.875rem (14px) | 1.5 | 400 | Body small, labels |
| text-base | 1rem (16px) | 1.6 | 400 | Body text |
| text-lg | 1.125rem (18px) | 1.6 | 500 | Lead paragraphs |
| text-xl | 1.25rem (20px) | 1.4 | 600 | Subheadings |
| text-2xl | 1.5rem (24px) | 1.3 | 600 | Section titles |
| text-3xl | 1.875rem (30px) | 1.2 | 700 | Page titles |
| text-4xl | 2.25rem (36px) | 1.1 | 700 | Hero headlines |
| text-5xl | 3rem (48px) | 1.1 | 800 | Major headlines |
| text-6xl | 3.75rem (60px) | 1.0 | 800 | Display text |

## Spacing System

### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Micro spacing |
| space-2 | 8px | Tight spacing |
| space-3 | 12px | Compact spacing |
| space-4 | 16px | Standard spacing |
| space-5 | 20px | Medium spacing |
| space-6 | 24px | Section spacing |
| space-8 | 32px | Large sections |
| space-10 | 40px | Major sections |
| space-12 | 48px | Hero spacing |
| space-16 | 64px | Page sections |

## Border Radius
- radius-sm: 6px - Small elements
- radius-md: 8px - Inputs, buttons
- radius-lg: 12px - Cards, containers
- radius-xl: 16px - Large cards
- radius-2xl: 24px - Feature cards
- radius-full: 9999px - Pills, avatars

## Shadows & Effects

### Shadows
- shadow-sm: `0 1px 2px rgba(0,0,0,0.1)`
- shadow-md: `0 4px 6px -1px rgba(0,0,0,0.1)`
- shadow-lg: `0 10px 15px -3px rgba(0,0,0,0.1)`
- shadow-glow: `0 0 40px rgba(79, 70, 229, 0.3)`
- shadow-glow-cyan: `0 0 40px rgba(6, 182, 212, 0.3)`

### Glassmorphism
- backdrop-blur: `blur(20px)`
- glass-bg: `rgba(30, 41, 59, 0.6)`
- glass-border: `1px solid rgba(255,255,255,0.08)`

## Animation System

### Durations
- fast: 150ms - Micro interactions
- normal: 300ms - Standard transitions
- slow: 500ms - Page transitions

### Easings
- ease-out: `cubic-bezier(0, 0, 0.2, 1)` - Enter animations
- ease-in: `cubic-bezier(0.4, 0, 1, 1)` - Exit animations
- ease-in-out: `cubic-bezier(0.4, 0, 0.2, 1)` - Standard
- spring: `cubic-bezier(0.34, 1.56, 0.64, 1)` - Bouncy effects

### Key Animations
1. **fade-in**: Opacity 0→1 + translateY(10px→0)
2. **slide-up**: translateY(20px→0) + opacity
3. **scale-in**: scale(0.95→1) + opacity
4. **pulse**: Scale pulse for CTAs
5. **shimmer**: Loading skeleton animation

## Components

### Buttons

#### Primary Button
- Background: Gradient from primary to accent-cyan
- Text: White, font-semibold
- Padding: 12px 24px
- Border-radius: 12px
- Hover: Scale 1.02 + glow shadow
- Active: Scale 0.98

#### Secondary Button
- Background: transparent
- Border: 1px solid border color
- Text: white
- Hover: Background fill + border color change

#### Ghost Button
- Background: transparent
- Text: muted color
- Hover: Background subtle fill

### Cards

#### Course Card
- Background: glass effect (rgba(30,41,59,0.6))
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 16px
- Hover: Border color change + lift + glow
- Transition: 300ms ease-out

#### Feature Card
- Background: gradient subtle or solid
- Border-radius: 24px
- Padding: 32px
- Icon container: 56px circle with gradient bg

### Forms

#### Input Fields
- Background: rgba(15, 23, 42, 0.8)
- Border: 1px solid rgba(255,255,255,0.1)
- Border-radius: 12px
- Padding: 12px 16px
- Focus: Border color primary + subtle glow
- Placeholder: Muted text color

### Navigation

#### Navbar
- Height: 72px
- Background: Transparent → glass on scroll
- Border-bottom: None → subtle on scroll
- Transition: 300ms ease

#### Nav Links
- Font-weight: 500
- Color: Muted → white on hover/active
- Active indicator: Primary color

## Responsive Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Accessibility Standards
- WCAG AA compliant contrast ratios
- Focus visible states on all interactive elements
- Reduced motion support
- Semantic HTML structure
- ARIA labels where needed
