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

## Design System

### Brand Colors
- **Primary**: Vibrant purple gradient (#8b5cf6 → #a855f7)
- **Accent**: Pink/purple tones for energy and freshness
- **Base**: Grey tones for professional credibility

### Typography
- **Sans**: Inter - Clean, modern for body text
- **Serif**: Source Serif 4 - Academic credibility for article titles

### Key Principles
- Fresh & modern for early career researchers
- High energy with gradient accents
- Professional academic credibility
- Full accessibility compliance (WCAG 2.1 AA)

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

### Browser Extension Development
- Extension uses Manifest V3 for Chrome/Edge/Firefox compatibility
- Content script URL is hardcoded to `http://localhost:5000` - update for production
- Icons can be generated using `browser-extension/create-icons.html`

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
