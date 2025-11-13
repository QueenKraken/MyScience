# Design Guidelines: MyScience Research Discovery Platform

## Design Approach

**Netflix for Science: Content-First Discovery**
Primary inspiration from Netflix and Spotify's immersive, media-rich interfaces adapted for research discovery. Focus on visual impact, horizontal exploration, and smooth browsing experiences.

**Core Principles:**
- Immersive content showcase with large visuals
- Minimal UI chrome, maximum content visibility
- Horizontal carousels for natural discovery flow
- Smooth micro-interactions that delight
- Dark mode as primary aesthetic with ambient lighting

**Reference Pattern:**
Netflix homepage structure: Large hero → horizontal content rows → persistent navigation

---

## Colors

**Primary Palette:**
- **Brand Teal:** #14B8A6 (primary actions, accents, focus states)
- **Netflix Black:** #141414 (dark mode backgrounds, cards)
- **Warm Cream:** #FAF7F5 (light mode backgrounds)
- **Neutral Grays:** #9CA3AF (metadata), #6B7280 (secondary text), #E5E7EB (borders)

**Dark Mode (Primary):**
- Background: #141414
- Card backgrounds: #1F1F1F
- Ambient glow: rgba(20, 184, 166, 0.15) around hovered cards
- Text: #FFFFFF (primary), #D1D5DB (secondary)

**Light Mode:**
- Background: #FAF7F5
- Card backgrounds: #FFFFFF
- Text: #1F2937 (primary), #6B7280 (secondary)

**Interactive States:**
- Hover: Teal glow, scale transforms
- Active: Darker teal (#0F766E)
- Focus: ring-2 ring-teal-500 ring-offset-2

---

## Typography

**Font Stack:**
- **Primary:** Inter (Google Fonts) - UI, body text, metadata
- **Display:** Source Serif 4 (Google Fonts) - Article titles, hero headlines

**Hierarchy:**
- Hero Headlines: 4xl to 6xl, font-bold, Source Serif 4
- Section Headers: xl to 3xl, font-semibold, Inter
- Article Titles: lg to 2xl, font-medium, Source Serif 4
- Body Text: base to lg, Inter, leading-relaxed
- Metadata: sm, font-medium, Inter, tracking-wide, uppercase, text-gray-500

---

## Layout System

**Spacing Primitives:**
Core units: **4, 6, 8, 12, 16, 20**
- Component internals: 4, 6
- Between elements: 8, 12
- Section spacing: 16, 20

**Container Strategy:**
- Full-bleed sections for hero and carousels
- Content containers: max-w-7xl, px-6 lg:px-8
- Reading width: max-w-4xl for article details
- Horizontal scroll: snap-x snap-mandatory, pb-4 for scrollbar clearance

---

## Component Library

### Navigation
- **Fixed header:** h-16, backdrop-blur-xl, bg-black/80 (dark) or bg-cream/80 (light)
- **Logo left, search center, profile right**
- Transparent on hero, solidifies on scroll
- Z-index: 50

### Hero Section
- **Height:** 80vh minimum, maintains aspect ratio
- **Visual:** High-quality research imagery (abstract science visuals, lab environments, data visualizations)
- **Layout:** Full-bleed background image with gradient overlay (from transparent to bg-black)
- **Content overlay:** Left-aligned, max-w-2xl, positioned in lower-third
- **Elements:** Category badge, headline (4xl-6xl Source Serif), 2-3 line description, CTA buttons with blurred backgrounds (backdrop-blur-md bg-white/10)
- **Buttons:** Primary teal button + secondary ghost button, gap-4

### Horizontal Carousels
- **Section header:** 2xl font-semibold, mb-6
- **Card layout:** flex gap-4, snap-start on each card, horizontal scroll with hidden scrollbar (scrollbar-hide)
- **Card dimensions:** w-64 to w-80, aspect-video for thumbnails
- **Grid fallback mobile:** grid-cols-2 gap-4 (no horizontal scroll on small screens)

### Article Cards
- **Large cards:** 280px × 420px, rounded-lg, overflow-hidden
- **Thumbnail:** aspect-video or square, object-cover, high-quality research visuals
- **Overlay:** Gradient from transparent to black on bottom third
- **Hover state:** scale-105, shadow-2xl, glow effect (dark mode), duration-300
- **Content:** Title (lg Source Serif), authors (sm), publication date
- **Preview on hover:** Expand to show abstract preview (200ms delay)

### Sidebar Navigation (Desktop)
- **Fixed left:** w-16 collapsed, w-64 expanded on hover
- **Icons:** Heroicons - home, bookmark, trending-up, cog
- **Labels:** Fade in on expand, duration-200

---

## Images

**Hero Section:**
Use striking, high-resolution research imagery:
- Abstract data visualizations (particle physics, molecular structures)
- Dynamic lab photography (pipettes, microscopes, experiments in action)
- Colorful scientific imagery (brain scans, chemical reactions, space)
Dimensions: 1920×1080 minimum, optimized WebP format

**Article Thumbnails:**
Every article card includes visual thumbnail:
- Journal cover artwork
- Paper's featured figure/diagram
- Field-specific stock imagery as fallback
Dimensions: 640×360 for video aspect, 400×400 for square cards

**Background Treatments:**
Subtle ambient backgrounds in dark mode - soft gradients, noise textures

---

## Animations

**Micro-Interactions (Essential to Experience):**
- **Card hover:** scale-105 + shadow-2xl + glow, duration-300, ease-out
- **Carousel scroll:** smooth-scroll, snap alignment
- **Hero parallax:** Subtle background shift on scroll (20-30% speed difference)
- **Loading states:** Skeleton screens with shimmer effect
- **Page transitions:** Fade + slight upward slide (opacity + translate-y-4), duration-400

**Dark Mode Ambient Effects:**
- Glow around hovered cards: shadow-[0_0_40px_rgba(20,184,166,0.3)]
- Subtle pulse on active carousel indicators

---

## Accessibility

**Keyboard Navigation:**
- Horizontal carousels: Arrow keys navigate cards, Home/End to bounds
- Focus indicators: Prominent teal ring (ring-2 ring-teal-500)
- Skip links: "Skip to main content," "Skip carousel"

**Screen Readers:**
- Carousel controls: aria-label, aria-live for dynamic updates
- Card content: Proper heading hierarchy (h2 for titles)
- Image descriptions: Descriptive alt text for all thumbnails

**Interactive Elements:**
- Minimum 44×44px touch targets
- Focus visible on all interactive elements
- Reduced motion: Disable parallax and scale effects via prefers-reduced-motion

---

## Key Experience Notes

**Discovery Flow:** Hero → Featured carousel → Category carousels → Personalized recommendations

**Content Density:** Dense, browsable layout prioritizing visual discovery over text

**Performance:** Lazy load carousel content, intersection observer for animations, optimize images

**Trust Signals:** Subtle journal badges, peer-review indicators, citation metrics