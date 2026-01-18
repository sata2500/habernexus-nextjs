# Technology Stack & Versions

**Objective:** To maintain a canonical list of all approved technologies and their required versions for this project. This ensures consistency and prevents compatibility issues.

**AI agents MUST consult this file before installing any new dependencies or starting a new task.**

**Last Updated:** 18 January 2026

---

## Core Technologies

| Technology | Required Version | Notes |
|---|---|---|
| **Node.js** | `>=20.9.0` (LTS 22 recommended) | `nvm` is recommended for version management. |
| **Next.js** | `~16.x` | App Router, React 19 support |
| **React** | `~19.x` | Latest stable with concurrent features |
| **Prisma** | `~6.x` | Modern ORM with SQLite support |
| **TypeScript** | `~5.x` | Strict mode enabled |
| **Tailwind CSS** | `~3.x` | Utility-first CSS framework |

## Authentication & Security

| Technology | Required Version | Notes |
|---|---|---|
| **Auth.js (NextAuth.js v5)** | `5.0.0-beta.x` | Google OAuth integration |
| **@auth/prisma-adapter** | `~2.x` | Prisma adapter for Auth.js |

## AI & Content

| Technology | Required Version | Notes |
|---|---|---|
| **@google/genai** | `~1.x` | Gemini AI API client |

## Deployment & Process Management

| Technology | Required Version | Notes |
|---|---|---|
| **PM2** | Latest | Process manager for production |
| **Caddy** | Latest | Recommended web server with auto SSL |
| **Nginx** | Latest | Alternative web server |

## Development Tools

| Technology | Required Version | Notes |
|---|---|---|
| **ESLint** | `~9.x` | Code linting |
| **Husky** | `~9.x` | Git hooks |
| **Commitlint** | `~20.x` | Commit message linting |
| **Semantic Release** | `~25.x` | Automated versioning |

---

## Library Installation Policy

- **Do not install new libraries without approval.** If your research indicates a new library is needed, you must propose this change to the user by creating a new Architectural Decision Record (ADR) and getting it approved.
- **Always check for existing functionality.** Before proposing a new library, ensure that the functionality you need does not already exist in the project or in one of the already-approved libraries.
- **Keep dependencies updated.** Run `npm outdated` regularly and update dependencies following semantic versioning rules.

---

## Version Compatibility Notes

1. **Next.js 16 + React 19:** This combination requires careful attention to Server Components and Client Components boundaries.
2. **Prisma 6:** Uses the new query engine. Ensure `prisma generate` is run after schema changes.
3. **Auth.js v5 Beta:** Still in beta, but stable for production use. Monitor for breaking changes.
