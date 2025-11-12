# MyScience - Research Discovery Platform

## Overview
MyScience is a personalized research discovery platform for early career researchers, aiming to be a "Netflix for Science." It enables users to discover, save, and connect with scientific research tailored to their interests, and interact with other researchers through social features. The project includes a browser extension for seamless integration with scientific websites and a web application for personalized content discovery and profile management.

## User Preferences
I prefer modern, clean, and human-centered design principles, similar to Notion, Read.cv, Spotify, Are.na, and Linear. I value progressive disclosure, reduced friction in user interactions, and a focus on accessibility (WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility, reduced motion, high contrast mode). I expect secure implementations by default, including server-side validation and protected routes.

## System Architecture
The project comprises a **Browser Extension** (Manifest V3) for injecting MyScience features into research websites and a **Web Application** built with React, TypeScript, Vite, and an Express.js backend.

**Key Technical Decisions:**
*   **Authentication**: Replit Auth (Google, GitHub, email/password via OIDC) with Express sessions stored in PostgreSQL.
*   **Database**: PostgreSQL (Neon-backed) managed with Drizzle ORM.
*   **Frontend Stack**: React, TypeScript, Vite.
*   **Styling**: Tailwind CSS + Shadcn UI components.
*   **State Management**: TanStack Query (React Query v5) for data fetching and caching with optimistic UI updates.
*   **Routing**: Wouter with authentication guards.
*   **Backend**: Express.js for the API, with protected endpoints for user profiles, saved articles, and social features.
*   **UI/UX Design**:
    *   **Brand Colors**: Primary electric blue, accent coral pink and bright green, with clean greys.
    *   **Typography**: Poppins for headings, Inter for body text, Source Serif 4 for article titles.
    *   **Design Principles**: Human-first design (e.g., ResearcherProfileCard, interest badges), progressive disclosure (expandable abstracts, hover tooltips), and friction reduction (inline actions, seamless auth).
    *   **Core Features**: Personalized "For You" research feed, topic filter pills with multi-select (logical OR) and dynamic filtering, search functionality, saved articles management, and social interactions (follow users/authors, like articles).
    *   **Notifications**: Real-time notification system with unread counts, read/unread management, and clickable notifications that navigate to user profiles. Dropdown shows loading state while fetching.
    *   **Profile Management**: Comprehensive user profiles with ORCID, Sciety ID, bio, and subject areas. User profiles accessible at /profiles/:userId with tabs (Overview, Followers, Following), follow/unfollow functionality, and follower/following stats.
    *   **People Discovery**: /people page for discovering researchers with search (name, email, bio) and subject area filtering. Multi-select filter badges with logical OR for subject areas. User cards show profile image, name, email, bio preview, and subject badges.
    *   **Security**: Server-side user ID injection, authentication middleware for protected routes, httpOnly session cookies, Zod validation, parameterized SQL queries preventing injection attacks, and CSRF protection.
*   **Gamification System**:
    *   **Level Progression**: 31 levels (0-30) using XP formula: `XP_required(n) = 100 × n^1.7` for exponential growth
    *   **Badge System**: 14 badges across 4 tiers (Common/Rare/Epic/Legendary) with triggers for actions like account creation, saves, likes, follows, profile completion
    *   **Badge Triggers**: Integrated into account creation (First Steps), article saves (First Save), article likes (First Like), user follows (Connector at 5 follows), ORCID connection (Identity Verified), and profile completion (Profile Complete - requires firstName, lastName, bio, and subject areas)
    *   **XP & Levels**: Tracked per user with automatic level-up detection and badge awarding
    *   **API Endpoints**: `/api/gamification/progress`, `/api/gamification/badges`, `/api/gamification/user-badges`
    *   **Known Limitation (MVP)**: Badge awarding runs synchronously in request path for immediate UX feedback. Production should migrate to background queue (Bull/BullMQ) with post-commit hooks and WebSocket/SSE for real-time updates to prevent potential transaction deadlocks.
    *   **Database**: Uses PostgreSQL unique constraints to prevent duplicate badge awards under concurrent requests, with atomic badge seeding via `onConflictDoUpdate`
*   **Activity Feed System**:
    *   **Real-time Activity**: GET `/api/activity-feed` endpoint aggregates user's own activities (saves, likes, earned badges) and social activities from followed users
    *   **Activity Types**: Displays saves, likes, badge awards, and social activities (followed users' saves and likes)
    *   **Timestamps**: Shows relative time format (e.g., "2 hours ago", "Yesterday")
    *   **Interactive Links**: Activities include clickable links to articles and user profiles
    *   **Recent Activity Widget**: Displays last 10 activities in homepage sidebar with formatted timestamps and hover states
*   **Navigation & Spacing**:
    *   **AppHeader Design**: Improved spacing with logical grouping (navigation items, user controls, status indicators)
    *   **Visual Hierarchy**: Vertical separator between navigation and user controls, consistent gaps for better breathing room
    *   **Adaptive Header**: Shows different navigation for authenticated vs unauthenticated users
    *   **Logout System**: User menu dropdown with Profile and Logout options, session destruction on logout
*   **Bonfire Forum System**:
    *   **Forum Feed**: `/bonfire` page displays public posts with create, like, edit, delete functionality
    *   **Post Creation**: Textarea form with user avatar, linked articles support
    *   **Post Cards**: Display author info, content, timestamps, like counts, comment counts, edit/delete for own posts
    *   **Navigation**: Flame icon in AppHeader for quick access
    *   **API Endpoint**: GET `/api/forum-posts` returns enriched posts via `getForumPostsWithMeta` storage method
    *   **Performance Note**: Current implementation uses N+1 queries acceptable for MVP traffic (<100 posts). Future optimization with JOIN-based aggregation or counter-caching recommended when load exceeds 5k daily reads or latency >300ms

## External Dependencies
*   **Authentication Providers**: Google, GitHub (via Replit Auth OIDC)
*   **Database**: PostgreSQL (Neon)
*   **Frontend Libraries**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack Query (React Query v5), Wouter, Zod
*   **Backend Libraries**: Express.js, Drizzle ORM
*   **External Research Platforms (Browser Extension Targets)**: eLifeSciences.org, Sciety.org, bioRxiv.org