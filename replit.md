# MyScience - Research Discovery Platform

## Overview
MyScience is a personalized research discovery platform for early career researchers. It provides a "Netflix for Science" experience, helping researchers discover, save, and connect with scientific research tailored to their interests.

## Current State (MVP - November 2025)
✅ **MVP Complete** - Fully functional prototype with end-to-end testing verified

The project delivers a working prototype with the following components:

### Browser Extension
- **Location**: `browser-extension/`
- **Purpose**: Injects a floating MyScience button into scientific research websites
- **Supported Sites**: eLifeSciences.org, Sciety.org, bioRxiv.org
- **Features**:
  - Beautiful gradient purple button matching brand colors
  - Keyboard accessible and screen reader compatible
  - Automatic user ID generation and persistence
  - Return navigation tracking

### Web Application
- **Stack**: React + TypeScript + Vite + Express
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter

### Backend API
- **Framework**: Express.js
- **Storage**: In-memory (MemStorage) for prototype
- **Endpoints**:
  - `GET /api/user/:userId` - Get or create user profile
  - `PUT /api/user/:userId` - Update user profile
  - `GET /api/user/:userId/saved-articles` - Get user's saved articles
  - `POST /api/saved-articles` - Save an article
  - `DELETE /api/saved-articles/:articleId` - Remove saved article

## Data Model

### User Profile
```typescript
{
  id: string;              // User identifier from localStorage
  name: string | null;
  orcid: string | null;    // For future ORCID integration
  scietyId: string | null; // For future Sciety integration
  preferences: {
    topics?: string[];
    emailNotifications?: boolean;
  } | null;
  createdAt: Date;
}
```

### Saved Article
```typescript
{
  id: string;
  userId: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  tags: string[] | null;
  externalUrl: string | null;
  savedAt: Date;
}
```

## User Flow
1. User visits a supported research site (eLife, Sciety, or bioRxiv)
2. Browser extension injects floating MyScience button
3. User clicks button → opens MyScience in new tab
4. MyScience displays personalized research feed
5. User can save articles, browse recommendations
6. "Return to [site]" button takes user back to original article

## Design System (November 2025 Refresh)

### Brand Colors
- **Primary**: Electric blue (#0078FF) - Energy and discovery
- **Accent 1**: Coral pink (#FF4F81) - Warmth and engagement  
- **Accent 2**: Bright green (#00E0A1) - Growth and fresh ideas
- **Base**: Clean greys for professional credibility

### Typography
- **Headings**: Poppins - Modern, friendly, energetic
- **Body**: Inter - Clean, readable for extended reading
- **Article Titles**: Source Serif 4 - Academic credibility

### Design Inspiration (Mood Board)
MyScience draws inspiration from modern content platforms:
- **Notion**: Progressive disclosure, generous white space, subtle interactions
- **Read.cv**: Human-first profiles, typography-forward design
- **Spotify**: Discovery-focused layout, inline actions, personalized feeds
- **Are.na**: Elegant minimalism, content organization
- **Linear**: Calm productivity, keyboard shortcuts

### UI Features (Slices 1-3 Complete)

**Human-First Design (Slice 1)**
- ResearcherProfileCard showcases the person, not just publications
- Live stats: saved articles count, weekly reading time
- Interest badges showing top 3 research topics
- Inline article actions (Save, Share, Cite, Read)
- Real anchor links that open in new tabs

**Progressive Disclosure (Slice 2)**  
- Expandable abstracts with "Read more/less" (200+ characters)
- Hover tooltips on all action buttons for guidance
- Smooth 300ms transitions (Notion-inspired)
- Clean, minimal expand/collapse affordances

**Discovery Hub (Slice 3)**
- "For You" section header (Spotify-inspired)
- Topic filter pills with toggle functionality
- Multi-select filtering (logical OR - show articles matching ANY selected topic)
- Dynamic "Clear filters" button
- Filter pills: Gene Editing, Climate Change, Machine Learning, CRISPR, Ethics
- Badge interactions with hover-elevate effects

### Key Principles
- **Human-first**: Showcase researchers, not just papers
- **Progressive disclosure**: Reveal complexity gradually
- **Reduce friction**: Inline actions, no modals
- **Modern & fresh**: Clean spacing, subtle animations
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation

## Installation & Setup

### Web App
```bash
npm install
npm run dev  # Starts on http://localhost:5000
```

### Browser Extension
See `browser-extension/README.md` for installation instructions.

## Future Roadmap (Not Yet Implemented)

### Phase 2 - Authentication & Personalization
- ORCID OAuth integration
- Sciety API integration
- User preference settings
- Reading history tracking

### Phase 3 - Recommendations Engine
- ML-based article recommendations
- Cross-site activity tracking
- Topic modeling and interest detection
- Collaborative filtering

### Phase 4 - Social & Collaboration
- Shared reading lists
- Research team collaboration
- Article annotations and notes
- Discussion threads

### Phase 5 - Production Ready
- PostgreSQL database migration
- Real deployment infrastructure
- Performance optimization
- Analytics and monitoring

## Development Notes

### Mock Data vs Real Data
- **Saved Articles**: Fully functional with real API integration (persists in-memory during server session)
- **Recommendations**: Currently using mock article data for UI prototyping (3 hardcoded articles)
- **Search**: Works across both saved and mock articles
- **User Profiles**: Real API integration with localStorage-based identification

Look for `// todo: remove mock functionality` comments to identify placeholder code for future enhancement.

### localStorage Usage
User IDs are stored in localStorage as `myscience_user_id`. This provides basic persistence without requiring authentication in the prototype phase.

### Data Persistence
- **Within Server Session**: All saved articles and user profiles persist correctly across page reloads
- **Across Server Restarts**: Data is lost (in-memory storage limitation)
- **End-to-End Testing**: Verified complete flow from extension → save article → reload → persistence

### Browser Extension Configuration
- Extension uses Manifest V3 for Chrome/Edge/Firefox compatibility
- Currently configured to use Replit development URL: `https://workspace.ashaw7.replit.dev`
- This allows for demonstrations and testing without public deployment
- Icons can be generated using `browser-extension/create-icons.html`
- See `DEMO_GUIDE.md` for demonstration instructions

## Open Source & Accessibility
- All code is designed for open source release
- Full keyboard navigation support
- Screen reader compatible
- ARIA labels on all interactive elements
- Reduced motion support
- High contrast mode support

## Project Structure
```
├── browser-extension/     # Browser extension files
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/              # Express backend
├── shared/              # Shared types and schemas
└── replit.md           # This file
```
