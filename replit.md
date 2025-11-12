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

## External Dependencies
*   **Authentication Providers**: Google, GitHub (via Replit Auth OIDC)
*   **Database**: PostgreSQL (Neon)
*   **Frontend Libraries**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack Query (React Query v5), Wouter, Zod
*   **Backend Libraries**: Express.js, Drizzle ORM
*   **External Research Platforms (Browser Extension Targets)**: eLifeSciences.org, Sciety.org, bioRxiv.org