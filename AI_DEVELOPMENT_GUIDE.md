# HaberNexus AI-First Development Guide

**Version:** 1.0
**Status:** Active

## 1. Core Philosophy: The Unified Agent

This project is designed to be developed by multiple, independent AI agents working in concert. The ultimate goal is for all agents to act as a single, hyper-competent developer.

**Your primary directive is to maintain and enhance this unified workflow.**

### Guiding Principles:

1.  **Clarity over cleverness:** Write code and documentation that is simple and unambiguous.
2.  **Consistency is paramount:** Adhere strictly to all established standards and conventions.
3.  **Learn from the past:** Proactively study the work of previous agents to avoid repeating errors and to build upon their successes.
4.  **Leave it better than you found it:** Your contribution must improve the project's overall quality, not just add a feature.

---

## 2. The AI Agent Development Lifecycle

Every development task you undertake **MUST** follow this lifecycle. No steps may be skipped.

### Step 1: Synchronization & Onboarding

Before writing any code, you must synchronize with the project's current state.

1.  **Read `README.md`:** Understand the project's purpose and basic structure.
2.  **Read `CONTRIBUTING.md`:** Understand the human-centric development rules (branching, commit formats, etc.).
3.  **Read this `AI_DEVELOPMENT_GUIDE.md` (this file) in its entirety:** This is your primary instruction set.
4.  **Review `ROADMAP.md`:** Understand the project's long-term vision and the current development stage.
5.  **Crucially, study the AI Knowledge Base:**
    *   `docs/ai-knowledge-base/decision_log.md`: Review architectural decisions and the reasoning behind them.
    *   `docs/ai-knowledge-base/known_errors.md`: **This is mandatory.** Study past errors and their resolutions to avoid repeating them.

### Step 2: Task Selection & Meticulous Planning

1.  **Select a Task:** Choose an open issue from the GitHub Issues tab. Prioritize issues with the `good first issue` or `help wanted` labels. Assign the issue to yourself.
2.  **Create a Development Plan:** This is a non-negotiable step. Create a new Markdown file for your plan at:
    `docs/ai-plans/issue-{number}/{plan-name}.md` (e.g., `docs/ai-plans/issue-15/implement-dark-theme.md`)

3.  **Plan Contents:** Your plan **MUST** include the following sections:
    *   **Objective:** A clear statement of what the feature or fix will accomplish.
    *   **Technology & Research:** List the technologies involved. Include a sub-step to perform web research on the *latest best practices* for implementing the solution with these technologies.
    *   **Step-by-Step Implementation:** A detailed, sequential list of coding tasks.
    *   **Testing Strategy:** A comprehensive plan to verify your code's correctness, including unit, integration, and end-to-end testing procedures.
    *   **Documentation Impact:** A list of all project documents (README, Wiki, etc.) that will need to be created or updated.
    *   **Error Log:** A section to log any errors encountered during development and their resolutions.

### Step 3: Implementation

1.  **Create a Branch:** Follow the naming convention in `CONTRIBUTING.md` (e.g., `feature/15-dark-theme`).
2.  **Write Code:** Implement your plan, adhering strictly to the project's coding standards (ESLint, Prettier).
3.  **Log Errors:** If you encounter a significant error, document it in your plan's **Error Log** section and, if it's a novel issue, add it to `docs/ai-knowledge-base/known_errors.md` after resolution.

### Step 4: Rigorous & Verifiable Testing

1.  **Execute Your Plan:** Perform all tests outlined in your testing strategy.
2.  **Document Results:** Record the outcome of each test in your development plan file. This provides a verifiable record of quality assurance.

### Step 5: Documentation & Knowledge Base Contribution

1.  **Update Project Docs:** Modify all documents identified in your plan's **Documentation Impact** section.
2.  **Update AI Knowledge Base:**
    *   **Decision Log:** If you made a significant architectural choice (e.g., selected a new library), add an entry to `docs/ai-knowledge-base/decision_log.md` explaining your choice and the rationale.
    *   **Known Errors:** If you encountered and solved a new, non-trivial bug, add a concise summary to `docs/ai-knowledge-base/known_errors.md`.

### Step 6: Committing and Creating a Pull Request

1.  **Commit Your Work:** Use the Conventional Commits format specified in `CONTRIBUTING.md`.
2.  **Include Your Plan:** Your development plan file(s) in `docs/ai-plans/` **MUST** be included in your commit. This is essential for traceability and for other agents to learn from your process.
3.  **Open a Pull Request:** Push your branch and open a PR against the `main` branch. Fill out the PR template completely.

---

## 3. Project Structure & File Organization

To maintain a clean and predictable environment, adhere to this structure.

*   `/app`: Core Next.js application logic.
*   `/components`: Reusable React components.
*   `/lib`: Shared utility functions, AI service clients, etc.
*   `/prisma`: Database schema and migration files.
*   `/public`: Static assets like images and fonts.
*   `/docs`: **The central hub for all non-code artifacts.**
    *   `/docs/ai-plans/`: Your detailed development plans.
    *   `/docs/ai-knowledge-base/`: The shared brain of all AI agents.
    *   `/docs/archive/`: Old plans and documents that are no longer relevant but are kept for historical context.

**Never pollute the root directory with temporary files or personal notes.** Use the `/docs` structure.

---

## 4. Error Handling and Learning Protocol

When you encounter an error:

1.  **Consult `known_errors.md`:** Check if a similar error has been solved before.
2.  **Isolate and Debug:** Understand the root cause.
3.  **Document:** Log the error and your solution in your development plan.
4.  **Share:** If the error is novel and significant, add it to `known_errors.md` so future agents can avoid it.

By following this lifecycle, you contribute not just code, but a structured, traceable, and intelligent process that elevates the entire project and all future contributors, both human and AI.
