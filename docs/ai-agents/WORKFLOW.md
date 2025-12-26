# AI Agent Development Workflow

**Objective:** To provide a detailed, step-by-step workflow for every phase of development, ensuring consistency and quality.

**You MUST follow these steps sequentially for every task.**

---

### Phase 1: Synchronization

1.  **Complete Onboarding:** Go through every item in `docs/ai-agents/ONBOARDING.md` and check them off.
2.  **Select a Task:**
    *   Review the open issues on the GitHub repository.
    *   Prioritize issues with the `good first issue` or `help wanted` labels.
    *   If no suitable issue exists, consult the `ROADMAP.md` and create a new issue for the next logical feature or improvement.
    *   Assign the issue to yourself.

### Phase 2: Research

1.  **Identify Technologies:** List all technologies involved in solving the issue (e.g., Next.js, Prisma, NextAuth.js).
2.  **Conduct Web Research:** This is a **mandatory** step. Perform web searches for the *latest best practices* for implementing the solution with the identified technologies. Search queries should be specific (e.g., "next.js 14 google oauth with prisma role assignment").
3.  **Analyze Internal Code:** Review any existing code in the project that is related to your task. Understand how it works before adding or changing it.
4.  **Synthesize Findings:** Summarize your research in the "Research & Findings" section of your development plan.

### Phase 3: Planning

1.  **Create Plan File:** Create a new Markdown file for your plan at `docs/ai-plans/active/issue-{number}-{short-description}.md`.
2.  **Use the Template:** Copy the content from `docs/ai-plans/templates/PLAN_TEMPLATE.md` into your new file.
3.  **Fill Out the Plan:** Meticulously fill out every section of the plan template. The "Step-by-Step Implementation" section must be detailed enough for another agent to understand and execute.

### Phase 4: Implementation

1.  **Create a Branch:** Follow the naming convention in `CONTRIBUTING.md` (e.g., `feature/15-user-authentication`).
2.  **Write Code:** Implement your plan, adhering strictly to the project's coding standards (ESLint, Prettier, TypeScript).
3.  **Commit Frequently:** Use the Conventional Commits format specified in `CONTRIBUTING.md`. Your commit messages should be clear and descriptive.
4.  **Log Errors:** If you encounter a significant error, document it immediately in your plan's **Error Log** section. If it's a novel issue, also create a new error file using `docs/ai-plans/templates/ERROR_TEMPLATE.md`.

### Phase 5: Verification

1.  **Execute Quality Checklist:** Go through every item in `docs/ai-agents/QUALITY_CHECKLIST.md`. This is **non-negotiable**.
2.  **Document Test Results:** Record the outcome of each test in your development plan file. This provides a verifiable record of quality assurance.

### Phase 6: Publishing

1.  **Create Pull Request:** Push your branch and open a Pull Request against the `main` branch.
2.  **Fill Out PR Template:** The PR description must be comprehensive, linking to the issue and your development plan file.
3.  **Include Your Plan:** Your development plan file(s) and any new knowledge base entries **MUST** be included in your commit and PR.

### Phase 7: Documentation

1.  **Update Project Docs:** Modify all documents identified in your plan's **Documentation Impact** section (e.g., `README.md`, `wiki/`).
2.  **Update AI Knowledge Base:**
    *   **Decisions:** If you made a significant architectural choice, create a new ADR file in `docs/ai-knowledge-base/decisions/` using the decision template.
    *   **Errors:** If you solved a new, non-trivial bug, move the error file from your plan to `docs/ai-knowledge-base/errors/`.
    *   **Learnings:** If you discovered a useful technique or best practice, add it to a relevant file in `docs/ai-knowledge-base/learnings/`.

### Phase 8: Cleanup

1.  **Archive Your Plan:** Once your PR is merged, move your development plan file from `docs/ai-plans/active/` to `docs/ai-plans/completed/`.
2.  **Delete Branch:** Delete your feature branch after the PR is merged.
3.  **Final Check:** Ensure no temporary files or personal notes are left in the project directory.
