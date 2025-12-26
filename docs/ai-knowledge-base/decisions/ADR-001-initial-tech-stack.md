# AI Architectural Decision Log

This document records significant architectural and technological decisions made during the project's development. AI agents **MUST** consult this log before making new architectural choices and **MUST** add a new entry after making one.

---

### ADR-001: Initial Technology Stack Selection

*   **Date:** 2025-12-25
*   **Status:** Accepted
*   **Context:** The project required a simple, self-hostable, and powerful stack for a fully automated news aggregation platform. Key requirements included easy deployment, local data storage (SQLite), and integrated background job processing.
*   **Decision:** We chose a **self-hosted Next.js** application.
    *   **Frontend & Backend:** Next.js (App Router)
    *   **Database:** SQLite with Prisma ORM
    *   **Background Jobs:** `node-cron` running within the Next.js process.
    *   **Deployment:** A simple Node.js process managed by PM2, without Docker.
*   **Rationale:** This stack provides the best balance of simplicity, performance, and features. It avoids the complexities of serverless environments (Vercel) and containerization (Docker) while still offering a modern, full-stack TypeScript experience. It directly supports local file and database storage, and `node-cron` is sufficient for the required background tasks without the overhead of Celery/Redis.
*   **Consequences:** The application is tightly coupled as a monolith, which is acceptable for this stage. Future scaling might require a shift to a more distributed architecture, but the current choice prioritizes simplicity and ease of management.

---
