# HaberNexus - AI Agent Briefing Document

**TO:** New AI Development Agent
**FROM:** Previous AI Development Agent
**DATE:** December 26, 2025
**SUBJECT:** Project Handover and v1.0 MVP Development Kick-off

## 1. Mission Objective

Your primary mission is to advance the HaberNexus project to the **v1.0 Minimum Viable Product (MVP)** stage. You are taking over a project with a fully prepared foundation. Your task is to build the first functional features on top of this foundation.

## 2. Core Directives

1.  **Adhere to the AI Development Guide:** Your entire workflow **MUST** follow the 6-step cycle outlined in `AI_DEVELOPMENT_GUIDE.md`. This is non-negotiable.
2.  **Consult the Knowledge Base:** Before writing any code, you **MUST** consult `docs/ai-knowledge-base/` to understand past architectural decisions (`decision_log.md`) and avoid repeating known mistakes (`known_errors.md`).
3.  **Follow the Roadmap:** Your development priorities are defined in `ROADMAP.md`. Do not deviate from the v1.0 MVP feature set unless explicitly instructed by the user.
4.  **Document Everything:** Every new decision, error, or significant finding must be documented in the appropriate knowledge base file.

## 3. Project State Analysis

### 3.1. Repository

*   **URL:** `https://github.com/sata2500/habernexus-nextjs`
*   **Current State:** The repository contains the complete project skeleton, documentation, and AI-first infrastructure. The `main` branch is stable.

### 3.2. Technology Stack

| Component | Technology | Key Details |
|---|---|---|
| **Framework** | Next.js (App Router) | The core of the application. You will be building pages, API routes, and components within this framework. |
| **Database** | SQLite + Prisma | The database schema is defined in `prisma/schema.prisma`. Use Prisma Client for all database interactions. |
| **Background Jobs** | `node-cron` | To be implemented for RSS fetching. It will run as part of the main Next.js process. |
| **Deployment** | PM2 | The target production environment will use PM2. Keep this in mind for any environment-specific code. |

### 3.3. Known Issues & Decisions

*   **Decision ADR-001:** The choice of a self-hosted monolith was deliberate to prioritize simplicity and data ownership. Do not attempt to refactor into a microservices architecture.
*   **Error ERR-001:** `create-next-app` fails in non-interactive environments. The project was set up manually.
*   **Error ERR-002:** `npm install` can be slow in low-resource environments. This is a known constraint of the sandbox.
*   **Error ERR-003:** The application requires Node.js v20.9.0+. An explicit check and guide are in place.

## 4. Immediate Task: v1.0 MVP - Feature 1 (User System)

Your first assignment is to begin development of the **User & Role System**.

### 4.1. Requirements

1.  **Google OAuth Integration:** Implement user sign-in and sign-up using NextAuth.js and the Google Provider.
2.  **Role-Based Access Control (RBAC):** The `User` model in `prisma/schema.prisma` has a `role` field (`ADMIN`, `AUTHOR`, `USER`). Your implementation must support this.
    *   The first user to sign up should automatically be assigned the `ADMIN` role.
    *   Subsequent users should be assigned the `USER` role by default.
3.  **Database Seeding:** The `ADMIN` user should be created via a Prisma seed script for the first run.
4.  **Basic UI:**
    *   A "Login" button.
    *   A "Logout" button and user profile picture in the header when logged in.
    *   A basic, protected `/account` page that displays the logged-in user's name, email, and role.

### 4.2. Suggested Plan of Action (To be confirmed by you)

1.  **Plan:** Create a detailed development plan in `docs/ai-plans/issue-{N}/` (create a new issue for this feature).
2.  **Setup:** Install `next-auth`.
3.  **Backend:** Configure NextAuth.js in `app/api/auth/[...nextauth]/route.ts`.
4.  **Frontend:** Create the UI components for login/logout buttons and the account page.
5.  **Database:** Implement the logic for role assignment.
6.  **Test:** Write tests (or perform manual tests and document them) to ensure:
    *   Login and logout work.
    *   Role assignment is correct.
    *   The `/account` page is protected.
7.  **Document:** Update `decision_log.md` with any new architectural decisions made.
8.  **Commit & PR:** Submit a pull request with a clear description of the changes.

## 5. Final Handover Checklist

-   [ ] Have you read and understood `AI_DEVELOPMENT_GUIDE.md`?
-   [ ] Have you reviewed the existing `decision_log.md` and `known_errors.md`?
-   [ ] Have you reviewed the `ROADMAP.md` and the v1.0 MVP feature set?
-   [ ] Are you prepared to follow the 6-step development cycle?

This project is now in your hands. Maintain the high standards of quality and documentation that have been established. Good luck.

**END OF BRIEFING**
