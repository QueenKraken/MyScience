# Design Guidelines: Scientific Research Discovery Platform

## Design Approach

**Reference-Based with System Foundation**
Drawing inspiration from content discovery platforms (Netflix, Medium, Notion) adapted for scientific research credibility. Balancing engaging content presentation with professional academic standards.

**Core Principles:**
- Credibility-first: Clean, professional aesthetics that command trust in academic context
- Content-forward: Design serves discovery, never distracts from research
- Frictionless navigation: Minimal clicks to value, clear pathways back

---

## Typography

**Font Stack:**
- **Primary:** Inter (via Google Fonts CDN) - Clean, highly legible for dense information
- **Accent:** Source Serif 4 (via Google Fonts CDN) - For article titles, academic credibility

**Hierarchy:**
- Hero/Page Titles: 3xl to 5xl, font-bold, Source Serif 4
- Section Headers: xl to 2xl, font-semibold, Inter
- Article Titles: lg to xl, font-medium, Source Serif 4
- Body Text: base to lg, font-normal, Inter, leading-relaxed
- Metadata/Labels: sm to base, font-medium, Inter, tracking-wide uppercase

---

## Layout System

**Spacing Primitives:**
Core spacing units: **2, 4, 6, 8, 12, 16** (as in p-2, gap-4, space-y-6, etc.)
- Micro spacing: 2, 4 (within components)
- Standard spacing: 6, 8 (between elements)
- Section spacing: 12, 16 (between major sections)

**Container Strategy:**
- Extension Button: Fixed positioning, bottom-right or integrated into site nav
- Web App: max-w-7xl centered container with px-6 for content areas
- Reading width: max-w-3xl for article content/descriptions

**Grid Patterns:**
- Article cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Content sections: Single column for reading, multi-column for browsing
- Dashboard widgets: grid-cols-1 lg:grid-cols-4 for stats/metrics

---

## Component Library

### Browser Extension Button
- **Floating Badge:** Fixed bottom-right (bottom-6 right-6), rounded-full, shadow-lg
- **Integrated Nav Button:** Matches host site's navigation styling, subtle branded indicator
- **Size:** 48px × 48px minimum (touch-friendly), 56px × 56px recommended
- **Icon:** Heroicons "home" or "academic-cap" via CDN
- **States:** Clear focus ring (ring-4), subtle scale on hover (scale-105)
- **Label:** Hidden text for screen readers, tooltip on hover

### Personalized Home Page

**Header Navigation:**
- Logo/Brand mark (left), primary navigation (center), user profile trigger (right)
- Height: 64px, border-b, sticky positioning
- "Return to [Site]" button prominent in top-right (with back arrow icon)

**Hero Section:**
- Welcome message with user's name (if available)
- Tagline: "Your personalized research feed"
- Quick stats: Articles saved, recommendations available
- Layout: Single column, py-12, max-w-4xl centered
- No background image needed - clean, focused entry

**Article Feed (Primary Content):**
- Card-based layout with generous whitespace
- Each card: Thumbnail/journal logo, title (Source Serif), authors, publication date, abstract preview (2-3 lines), action buttons
- Card padding: p-6, rounded-lg, border, hover:shadow-md transition
- Spacing: space-y-6 between cards

**Sidebar Widgets (Desktop):**
- Categories/Topics list
- Recent activity timeline
- Saved searches
- Fixed on scroll, max-w-xs

**Empty States:**
- Friendly illustrations or icons
- Clear call-to-action: "Connect your ORCID to get personalized recommendations"
- Centered content, py-16

---

## Accessibility Implementation

**Focus Management:**
- Extension button click moves focus to home page header
- Return button restores focus to original trigger location
- Skip links for keyboard navigation
- All interactive elements: min-height 44px

**ARIA Patterns:**
- Extension button: role="button", aria-label="Open personalized research feed"
- Return button: aria-label="Return to [site name]"
- Loading states: aria-live="polite" for dynamic content
- Article cards: Proper heading hierarchy (h2 for titles)

**Keyboard Navigation:**
- Tab order: Header → main content → sidebar
- Escape key: Close modals, return to previous view
- Arrow keys: Navigate article lists

---

## Animations

**Minimal, Purposeful Motion:**
- Button hover: subtle scale (scale-105), duration-200
- Card hover: shadow transition, duration-300
- Page transitions: fade-in only, duration-200
- Loading indicators: Simple spinner, no elaborate animations

---

## Images

**Extension Button:** Icon-only (no images)

**Web Application:**
- **No hero image** - Content-first approach
- **Journal/Publication Logos:** Small (40px × 40px) on article cards, rounded
- **User Avatar:** 32px × 32px circle in navigation, placeholder if not available
- **Empty State Illustrations:** Simple line art, max 200px width, centered

**Article Thumbnails:** 
- Optional depending on source data availability
- If used: aspect-ratio-video (16:9), object-cover, max-height 180px on cards
- Placeholder: Simple pattern or journal logo if no thumbnail available

---

## Key Considerations

**Cross-Site Consistency:** Extension button must feel native to each host site while maintaining subtle brand identity

**Return Mechanism:** Clear, persistent "Return to [original site]" navigation - never trap users

**Progressive Enhancement:** Core functionality works without JavaScript; enhanced features layer on top

**Performance:** Lazy load article cards, virtualize long lists, optimize for scientific images/PDFs

**Trust Signals:** Academic design language, clear data sourcing, transparent about personalization algorithms