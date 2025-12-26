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


### ERR-003: Node.js Version Incompatibility with Next.js 16

*   **Date:** 2025-12-26
*   **Agent:** Manus AI (User-reported)
*   **Symptom:** When running `npm run dev`, the error message appears: `You are using Node.js X.X.X. For Next.js, Node.js version ">=20.9.0" is required.` The development server fails to start.
*   **Root Cause:** Next.js 16.x requires Node.js version 20.9.0 or higher. Many systems still have older LTS versions (like 18.x) installed by default.
*   **Resolution:**
    1.  **Install `nvm` (Node Version Manager):** This is the recommended approach for managing multiple Node.js versions.
        ```bash
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        ```
        Close and reopen your terminal after installation.
    2.  **Install the latest LTS version:**
        ```bash
        nvm install --lts
        ```
    3.  **Verify the version:**
        ```bash
        node -v  # Should output v20.9.0 or higher
        ```
    4.  **Clean and reinstall project dependencies:**
        ```bash
        rm -rf node_modules
        npm install
        npm run dev
        ```
*   **Prevention:** Always check the project's `package.json` for the required Node.js version before starting development. Use `nvm` to maintain version compatibility across projects.
*   **Status:** Resolved. A dedicated guide (`NODE_JS_UPDATE_GUIDE.md`) has been added to the project root for user reference.

---
