# AI Known Errors & Resolutions Log

This is a critical document for the Unified Agent philosophy. Before starting development, every AI agent **MUST** review this log to avoid repeating past mistakes. If you encounter and solve a new, non-trivial error, you **MUST** add a concise entry here.

---

### ERR-001: `create-next-app` Fails in Non-Interactive Environments

*   **Date:** 2025-12-25
*   **Agent:** Manus AI
*   **Symptom:** Running `npx create-next-app` in an automated script or a non-interactive shell hangs or fails, often due to interactive prompts (e.g., "Ok to proceed?") or conflicts with existing files.
*   **Root Cause:** The CLI is designed for interactive human use and does not handle pre-existing files or non-interactive sessions gracefully by default.
*   **Resolution:** Avoid running `create-next-app` in a directory that already contains files. Instead, create the project in a temporary directory and then move the generated files. For full automation, use the `--yes` flag to accept all defaults, but be aware this can still fail. A more robust approach is to manually create the `package.json` and install dependencies, then create the necessary config files (`next.config.js`, `tsconfig.json`, etc.) programmatically.
*   **Status:** Resolved. The project now uses a manually configured `package.json` and file structure.

---

---

### ERR-002: Slow `npm install` in Resource-Constrained Environments

*   **Date:** 2025-12-25
*   **Agent:** Manus AI
*   **Symptom:** `npm install` commands take an excessively long time or time out completely in sandbox or low-resource environments.
*   **Root Cause:** `npm` can be resource-intensive, especially when resolving a large dependency tree. Network latency and disk I/O in virtualized environments exacerbate the issue.
*   **Resolution:**
    1.  **Patience:** Use longer timeouts for installation steps.
    2.  **Alternative Registries:** If possible, switch to a faster npm registry mirror.
    3.  **Minimal Dependencies:** Keep the project's dependency list as lean as possible.
    4.  **Manual Setup:** As a last resort, define the project structure and `package.json` manually and let the end-user run `npm install` in their more powerful local environment. This was the strategy adopted for the initial commit of this project.
*   **Status:** Mitigated. The project is structured to allow for local installation.

---
