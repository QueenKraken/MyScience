# MyScience - Research Discovery Platform

## Overview
MyScience is a personalized research discovery platform for early career researchers. It provides a "Netflix for Science" experience, helping researchers discover, save, and connect with scientific research tailored to their interests.

## Current State (MVP - November 2025)
✅ **MVP + Authentication & Profiles Complete** - Fully functional with secure authentication and user profiles

The project delivers a working application with the following components:

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
- **Authentication**: Replit Auth (Google, GitHub, email/password via OIDC)
- **Database**: PostgreSQL (Neon-backed) with Drizzle ORM
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter with authentication guards

### Backend API
- **Framework**: Express.js
- **Storage**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions stored in PostgreSQL
- **Authentication Endpoints**:
  - `GET /api/auth/user` - Get current authenticated user
  - `GET /api/login` - Initiate OIDC login flow
  - `GET /api/logout` - End session
- **Protected Endpoints** (require authentication):
  - `PUT /api/profile` - Update user profile
  - `GET /api/saved-articles` - Get user's saved articles
  - `POST /api/saved-articles` - Save an article
  - `DELETE /api/saved-articles/:articleId` - Remove saved article

## Data Model

### User Profile
```typescript
{
  id: string;                    // UUID from authentication provider
  email: string;                 // From authentication provider
  firstName: string | null;      // User's first name
  lastName: string | null;       // User's last name
  profileImageUrl: string | null; // Avatar URL
  orcid: string | null;          // ORCID identifier (e.g., 0000-0002-1825-0097)
  scietyId: string | null;       // Sciety username
  bio: string | null;            // Research background
  subjectAreas: string[] | null; // Research interests
  hashedPassword: string | null; // For email/password auth
  createdAt: Date;
  updatedAt: Date;
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

### First-Time User
1. User visits a supported research site (eLife, Sciety, or bioRxiv)
2. Browser extension injects floating MyScience button
3. User clicks button → opens MyScience in new tab
4. Landing page displays with authentication options
5. User signs in with Google, GitHub, or email/password
6. Redirected to personalized home page
7. User can complete profile with ORCID, research interests, bio

### Returning User
1. User visits MyScience (from extension or directly)
2. Automatically authenticated via session
3. Home page displays saved articles and recommendations
4. User can save/unsave articles, update profile
5. "Return to [site]" button (if from extension) goes back to original article

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
- **Reduce friction**: Inline actions, no modals, seamless auth
- **Modern & fresh**: Clean spacing, subtle animations
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Secure by default**: Server-side validation, protected routes, session management

## Installation & Setup

### Web App
```bash
npm install
npm run dev  # Starts on http://localhost:5000
```

### Browser Extension
See `browser-extension/README.md` for installation instructions.

## Pages & Features

### Landing Page (`/`)
- Modern hero section with feature highlights
- Call-to-action buttons for sign-in
- Responsive design
- **Status**: ✅ Complete

### Home Page (`/`) - Authenticated
- Personalized hero with user name and stats
- "For You" research feed
- Topic filter pills (multi-select, logical OR)
- Search functionality
- Saved articles display
- Researcher profile card
- **Status**: ✅ Complete

### Profile Page (`/profile`) - Authenticated
- Avatar/profile picture URL input with live preview
- Basic information (first/last name, email display)
- Research identity (ORCID iD, Sciety ID)
- Research interests (bio, subject areas with badge UI)
- Save and Reset functionality
- Form validation with Zod
- **Status**: ✅ Complete

## Future Roadmap

### Phase 2 - Enhanced Personalization
- ORCID OAuth integration (full SSO)
- Sciety API integration for recommendations
- User preference settings (email notifications, privacy)
- Reading history tracking and analytics

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

### Authentication & Data Persistence
- **Authentication**: Fully functional with Replit Auth (Google, GitHub, email/password)
- **Saved Articles**: Real PostgreSQL database integration
- **User Profiles**: Complete CRUD operations with database persistence
- **Sessions**: PostgreSQL session store with 7-day expiration
- **Recommendations**: Currently using mock article data for UI prototyping (3 hardcoded articles)
- **Search**: Works across both saved and mock articles

Look for `// todo: remove mock functionality` comments to identify placeholder code for future enhancement.

### Session & Data Persistence
- **Authentication**: Session cookies managed by Express with PostgreSQL backing
- **User Data**: All profile data persists in PostgreSQL
- **Saved Articles**: Stored in PostgreSQL with foreign key to user
- **Across Server Restarts**: Data persists (PostgreSQL database)
- **End-to-End Testing**: Verified complete auth flow, profile management, and article saving

### Security Features
- Server-side user ID injection (prevents privilege escalation)
- Protected API routes with authentication middleware
- Session-only cookies (httpOnly: true)
- Zod validation on all user inputs
- CSRF protection via session management

### Navigation & Branding
- MyScience logo displayed on all pages (landing, home, profile)
- Logo is clickable and navigates to home page
- Navigation bar includes:
  - Home icon button (returns to homepage)
  - Profile icon button (navigates to profile page)
  - Theme toggle (dark/light mode)
- Consistent header across all authenticated pages
- Logo image: Blue sparkle icon with "MyScience" text

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
