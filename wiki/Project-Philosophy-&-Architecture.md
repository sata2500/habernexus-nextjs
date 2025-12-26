# Project Philosophy & Architecture

This page details the core philosophy and architectural decisions behind the HaberNexus project.

## 🎯 Core Philosophy: "Simple but Powerful"

The primary goal of HaberNexus is to create a fully automated, high-performance news aggregation platform without unnecessary complexity. Every technological and architectural choice is guided by this principle.

| Principle | Implementation |
|---|---|
| **Simplicity** | Avoid complex, multi-service architectures (like microservices) in favor of a well-structured monolith. Minimize dependencies. |
| **Ownership** | All data (database, media files) is stored locally on the user's server. No reliance on third-party databases or storage services. |
| **Automation** | The entire content pipeline, from RSS fetching to AI-powered content generation and publishing, is designed to be 100% automated. |
| **Performance** | Leverage modern web technologies (Next.js, Server-Side Rendering) to ensure a fast and responsive user experience. |
| **Maintainability** | A clean codebase, comprehensive documentation, and a structured development process (especially for AI agents) are prioritized. |

## 🏗️ Architectural Overview: The Self-Hosted Monolith

HaberNexus is designed as a **self-hosted, monolithic application** built with Next.js.

### Why a Monolith?

- **Reduced Complexity:** A single codebase, a single deployment process, and a single point of management.
- **Faster Development:** No need to manage communication between different services.
- **Easier Debugging:** All logs and processes are in one place.

### Why Self-Hosted?

- **Data Sovereignty:** You control your data. The database and all media files reside on your server.
- **Cost-Effective:** Avoids potentially expensive cloud service fees for databases (Vercel Postgres) and storage (S3, R2).
- **Flexibility:** Not locked into a specific cloud provider's ecosystem (like Vercel).

## 🛠️ Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | Provides a full-stack experience (frontend and backend) in a single framework. Excellent performance and SEO with Server-Side Rendering. |
| **Database** | [SQLite](https://www.sqlite.org/index.html) | A single-file database that is incredibly simple to manage, back up, and move. Sufficiently powerful for this application's needs. |
| **ORM** | [Prisma](https://www.prisma.io/) | A modern, type-safe database toolkit that makes working with SQLite easy and secure. |
| **Background Jobs** | [`node-cron`](https://www.npmjs.com/package/node-cron) | A lightweight, pure-JavaScript job scheduler that runs within the Next.js process. Avoids the need for external services like Redis and Celery. |
| **Deployment** | [PM2](https://pm2.keymetrics.io/) | A production-grade process manager for Node.js applications. Ensures the app stays online, restarts on crashes, and handles logs. |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) | Provides powerful models for content analysis, generation, and image creation. |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) | A complete open-source authentication solution for Next.js applications, making Google OAuth integration straightforward. |

## 🔄 Data & Process Flow

1.  **Scheduled Task (`node-cron`):** A cron job, configured in the admin panel, triggers the content fetching process periodically.
2.  **RSS Fetching:** The system fetches new entries from all registered RSS feeds.
3.  **Content Extraction:** For each new entry, the full article content is extracted from the source URL.
4.  **AI Processing (Gemini):**
    *   The content is analyzed to determine its category and relevance.
    *   A new, unique article is generated based on the source content.
    *   A relevant image is generated for the new article.
5.  **Data Storage (SQLite/Prisma):** The new article, its category, and the path to the generated image are saved to the SQLite database.
6.  **Image Storage:** The generated image is optimized and saved to the `public/media/` directory on the local filesystem.
7.  **Serving Content (Next.js):** When a user visits the site, Next.js fetches the articles from the SQLite database and renders the pages on the server (SSR) for optimal performance and SEO.
