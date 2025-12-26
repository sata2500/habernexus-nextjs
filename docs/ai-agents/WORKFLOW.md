# AI Agent Development Workflow

**Version:** 2.0  
**Last Updated:** 26 December 2025  
**Status:** Active

**Objective:** To provide a detailed, step-by-step workflow for every phase of development, ensuring consistency, quality, and **incremental verification** at every step.

**You MUST follow these steps sequentially for every task. Each phase includes mandatory checkpoints.**

---

## Critical Principle: Incremental Development with Verification

> ⚠️ **IMPORTANT:** This workflow emphasizes **small, incremental changes** with **verification after each step**. Never implement multiple features at once without testing. This approach was established after encountering issues with large, unverified changes.

### The Verification Loop

```
┌─────────────────────────────────────────────────────────┐
│  For EVERY code change, follow this loop:               │
│                                                         │
│  1. Make ONE small change                               │
│  2. Run verification commands                           │
│  3. If PASS → Commit and continue                       │
│  4. If FAIL → Fix immediately, document in Error Log    │
│  5. Repeat                                              │
└─────────────────────────────────────────────────────────┘
```

### Mandatory Verification Commands

Run these commands after **every significant change**:

```bash
# 1. TypeScript Check (catches type errors)
npx tsc --noEmit

# 2. ESLint Check (catches code quality issues)
npm run lint

# 3. Build Test (catches runtime and import errors)
npm run build

# 4. Dev Server Test (optional but recommended)
npm run dev
```

---

## Phase 1: Synchronization

### Steps

1.  **Complete Onboarding:** Go through every item in `docs/ai-agents/ONBOARDING.md` and check them off.
2.  **Select a Task:**
    *   Review the open issues on the GitHub repository.
    *   Prioritize issues with the `good first issue` or `help wanted` labels.
    *   If no suitable issue exists, consult the `ROADMAP.md` and create a new issue for the next logical feature or improvement.
    *   Assign the issue to yourself.

### Checkpoint ✓

- [ ] All onboarding items completed
- [ ] Task selected and understood
- [ ] Related Knowledge Base entries reviewed (especially `/errors`)

---

## Phase 2: Research

### Steps

1.  **Identify Technologies:** List all technologies involved in solving the issue (e.g., Next.js, Prisma, NextAuth.js).
2.  **Check Tech Versions:** Verify versions in `docs/ai-knowledge-base/tech-stack/TECH_VERSIONS.md`.
3.  **Conduct Web Research:** This is a **mandatory** step. Perform web searches for the *latest best practices* for implementing the solution with the identified technologies.
4.  **Analyze Internal Code:** Review any existing code in the project that is related to your task.
5.  **Synthesize Findings:** Summarize your research in the "Research & Findings" section of your development plan.

### Checkpoint ✓

- [ ] All required technologies identified
- [ ] Tech versions verified
- [ ] Web research completed
- [ ] Existing code analyzed

---

## Phase 3: Planning

### Steps

1.  **Create Plan File:** Create a new Markdown file for your plan at `docs/ai-plans/active/issue-{number}-{short-description}.md`.
2.  **Use the Template:** Copy the content from `docs/ai-plans/templates/PLAN_TEMPLATE.md` into your new file.
3.  **Fill Out the Plan:** Meticulously fill out every section of the plan template.
4.  **Break Down into Micro-Steps:** The "Step-by-Step Implementation" section must be broken into **small, independently testable steps**. Each step should:
    *   Modify no more than 2-3 files
    *   Be completable in 5-15 minutes
    *   Have clear success criteria
    *   Include verification commands

### Checkpoint ✓

- [ ] Plan file created
- [ ] All sections filled out
- [ ] Implementation broken into micro-steps
- [ ] Each step has verification criteria

---

## Phase 4: Implementation

### The Incremental Implementation Process

> ⚠️ **CRITICAL:** Do NOT implement everything at once. Follow the micro-step approach.

#### For Each Micro-Step:

```
┌────────────────────────────────────────────────────────────┐
│ MICRO-STEP IMPLEMENTATION LOOP                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. ANNOUNCE: State what you're about to implement          │
│                                                            │
│ 2. IMPLEMENT: Write the code for this single step          │
│                                                            │
│ 3. VERIFY: Run all verification commands                   │
│    $ npx tsc --noEmit                                      │
│    $ npm run lint                                          │
│    $ npm run build                                         │
│                                                            │
│ 4. DOCUMENT: If errors occur, document immediately         │
│    - Add to Error Log in plan                              │
│    - Create Knowledge Base entry if novel                  │
│                                                            │
│ 5. COMMIT: Make a focused commit for this step             │
│    $ git add -A                                            │
│    $ git commit -m "feat(scope): description"              │
│                                                            │
│ 6. REPORT: Inform user of progress and any issues          │
│                                                            │
│ 7. PROCEED: Move to next micro-step only if all passes     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Implementation Rules

1.  **Create a Branch:** Follow the naming convention in `CONTRIBUTING.md` (e.g., `feature/15-user-authentication`).
2.  **One Thing at a Time:** Implement ONE micro-step before moving to the next.
3.  **Verify Immediately:** Run verification commands after EVERY change.
4.  **Commit Frequently:** Use the Conventional Commits format. Each micro-step should have its own commit.
5.  **Log Errors Immediately:** If you encounter ANY error, document it before attempting to fix.
6.  **Ask for Help:** If stuck on the same error for more than 2 attempts, ask the user for guidance.

### Common Pitfalls to Avoid

| Pitfall | Why It's Bad | What to Do Instead |
|---------|--------------|---------------------|
| Implementing multiple features at once | Hard to debug, errors compound | One feature, one commit |
| Skipping verification | Errors accumulate silently | Verify after every change |
| Not documenting errors | Same mistakes repeated | Document immediately |
| Large commits | Hard to review and rollback | Small, focused commits |
| Ignoring lint warnings | Technical debt accumulates | Fix all warnings |

### Checkpoint ✓ (After Each Micro-Step)

- [ ] Code written for this step
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Commit made with descriptive message
- [ ] User informed of progress

---

## Phase 5: Verification

### Full Verification Checklist

1.  **Execute Quality Checklist:** Go through every item in `docs/ai-agents/QUALITY_CHECKLIST.md`. This is **non-negotiable**.
2.  **Run Full Test Suite:**
    ```bash
    # Complete verification sequence
    npm run lint
    npx tsc --noEmit
    npm run build
    npm run dev  # Test manually in browser
    ```
3.  **Test User Scenarios:** Manually test all user-facing features affected by your changes.
4.  **Document Test Results:** Record the outcome of each test in your development plan file.

### Checkpoint ✓

- [ ] All Quality Checklist items verified
- [ ] Full test suite passes
- [ ] User scenarios tested
- [ ] Test results documented

---

## Phase 6: Publishing

### Steps

1.  **Final Verification:** Run the complete verification sequence one more time.
2.  **Create Pull Request:** Push your branch and open a Pull Request against the `main` branch.
3.  **Fill Out PR Template:** The PR description must be comprehensive, linking to the issue and your development plan file.
4.  **Include Your Plan:** Your development plan file(s) and any new knowledge base entries **MUST** be included in your commit and PR.

### Checkpoint ✓

- [ ] Final verification passed
- [ ] PR created with complete description
- [ ] All files included in PR

---

## Phase 7: Documentation

### Steps

1.  **Update Project Docs:** Modify all documents identified in your plan's **Documentation Impact** section (e.g., `README.md`, `wiki/`).
2.  **Update ROADMAP.md:** Mark completed features with ✅ and update progress percentages.
3.  **Update AI Knowledge Base:**
    *   **Decisions:** If you made a significant architectural choice, create a new ADR file.
    *   **Errors:** Move any novel error documentation to `docs/ai-knowledge-base/errors/`.
    *   **Learnings:** Add any new best practices to `docs/ai-knowledge-base/learnings/`.

### Checkpoint ✓

- [ ] README.md updated (if needed)
- [ ] ROADMAP.md updated
- [ ] Knowledge Base updated
- [ ] Wiki updated (if needed)

---

## Phase 8: Cleanup

### Steps

1.  **Archive Your Plan:** Once your PR is merged, move your development plan file from `docs/ai-plans/active/` to `docs/ai-plans/completed/`.
2.  **Delete Branch:** Delete your feature branch after the PR is merged.
3.  **Final Check:** Ensure no temporary files or personal notes are left in the project directory.
4.  **Provide Summary:** Give the user a final summary of what was accomplished.

### Checkpoint ✓

- [ ] Plan archived
- [ ] Branch deleted
- [ ] No temporary files remaining
- [ ] Summary provided to user

---

## Quick Reference: Verification Commands

```bash
# TypeScript Check
npx tsc --noEmit

# ESLint Check
npm run lint

# Build Test
npm run build

# Development Server
npm run dev

# Prisma Commands (if database changes)
npx prisma generate
npx prisma db push

# Git Commands
git status
git add -A
git commit -m "type(scope): description"
git push origin branch-name
```

---

## Troubleshooting Guide

### If Build Fails

1. Read the error message carefully
2. Check if it's a known error in `docs/ai-knowledge-base/errors/`
3. If it's a module not found error, ensure `npm install` was run
4. If it's a TypeScript error, fix the type issue
5. Document the error and solution

### If Lint Fails

1. Run `npm run lint` to see specific errors
2. Fix each error one by one
3. Re-run lint after each fix
4. Common issues: unused imports, missing types, formatting

### If Tests Fail

1. Identify which test failed
2. Check if the failure is related to your changes
3. Fix the issue or document if it's a pre-existing problem
4. Re-run tests after fix

---

**Remember:** The goal is not just to complete tasks, but to complete them in a way that maintains and improves the project's quality. Incremental development with verification is the key to achieving this.
