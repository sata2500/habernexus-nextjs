# Technology Stack & Versions

**Objective:** To maintain a canonical list of all approved technologies and their required versions for this project. This ensures consistency and prevents compatibility issues.

**AI agents MUST consult this file before installing any new dependencies or starting a new task.**

---

| Technology | Required Version | Approved Libraries |
|---|---|---|
| **Node.js** | `>=20.9.0` | `nvm` is recommended for version management. |
| **Next.js** | `~14.0.0` | `next-auth`, `@next-auth/prisma-adapter` |
| **React** | `~18.0.0` | `tailwindcss`, `postcss`, `autoprefixer` |
| **Prisma** | `~5.0.0` | `@prisma/client` |
| **TypeScript** | `~5.0.0` | N/A |
| **Scheduling**| N/A | `node-cron` |
| **Deployment**| N/A | `pm2` |

---

## Library Installation Policy

- **Do not install new libraries without approval.** If your research indicates a new library is needed, you must propose this change to the user by creating a new Architectural Decision Record (ADR) and getting it approved.
- **Always check for existing functionality.** Before proposing a new library, ensure that the functionality you need does not already exist in the project or in one of the already-approved libraries.
