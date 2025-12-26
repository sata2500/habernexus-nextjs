# AI Agent Onboarding Checklist

**Version:** 2.0  
**Last Updated:** 26 December 2025  
**Status:** Active

**Objective:** To ensure you, the AI agent, are fully synchronized with the project's context, standards, and history before beginning any task.

**You MUST complete every item on this checklist before proceeding to the Research Phase.**

---

## Critical First Steps

> ⚠️ **IMPORTANT:** Before doing anything else, ensure the development environment is properly set up.

### Environment Verification

Run these commands to verify the environment:

```bash
# 1. Check Node.js version (must be >= 20.9.0)
node -v

# 2. Check npm version
npm -v

# 3. Install dependencies (CRITICAL!)
npm install

# 4. Verify dependencies are installed
ls node_modules | head -10

# 5. Setup Prisma
npx prisma generate
npx prisma db push

# 6. Create .env file
cp .env.example .env

# 7. Test build
npm run build
```

If any of these commands fail, **STOP** and resolve the issue before proceeding.

---

## Phase 1: Project & Goal Comprehension

- [ ] **Read `README.md`:** Understand the project's purpose, core features, and basic setup.
- [ ] **Read `ROADMAP.md`:** Understand the project's long-term vision, current development stage, and the goals for the current version.
- [ ] **Identify Current Version:** Note which version is being developed (e.g., v1.0 MVP) and its completion status.

### Checkpoint ✓

- [ ] Can explain the project's purpose in one sentence
- [ ] Know the current development version and its goals
- [ ] Understand the tech stack (Next.js, Prisma, SQLite, etc.)

---

## Phase 2: Rules of Engagement

- [ ] **Read `AI_DEVELOPMENT_GUIDE.md`:** Understand the 8-phase development framework and the core philosophy.
- [ ] **Read `CONTRIBUTING.md`:** Understand the human-centric development rules you must also follow (branching, commit formats, etc.).
- [ ] **Read `docs/ai-agents/` directory in its entirety:**
    - [ ] `ONBOARDING.md` (this file)
    - [ ] `WORKFLOW.md` - **Pay special attention to the Incremental Development process**
    - [ ] `QUALITY_CHECKLIST.md` - **Memorize the verification commands**
    - [ ] `COMMUNICATION_PROTOCOL.md`

### Key Concepts to Understand

| Concept | Description | Why It Matters |
|---------|-------------|----------------|
| Incremental Development | Make small changes, verify after each | Prevents compound errors |
| Verification Loop | tsc → lint → build after each change | Catches errors early |
| Knowledge Base | Shared memory of all agents | Learn from past mistakes |
| Conventional Commits | Standardized commit messages | Clear history |

### Checkpoint ✓

- [ ] Understand the 8-phase development framework
- [ ] Know the verification commands by heart
- [ ] Understand why incremental development is important

---

## Phase 3: Learning from the Past (The Shared Brain)

> ⚠️ **MANDATORY:** This phase is critical. Skipping it leads to repeating past mistakes.

- [ ] **Review `docs/ai-knowledge-base/decisions/`:** Study all Architectural Decision Records (ADRs) to understand the reasoning behind the current system design.
- [ ] **Review `docs/ai-knowledge-base/errors/`:** This is **MANDATORY**. Study ALL past errors and their resolutions.
- [ ] **Review `docs/ai-knowledge-base/learnings/`:** Review tips and best practices discovered by previous agents.

### Known Error Categories

Before starting, be aware of these common error types:

| Error Type | Example | Prevention |
|------------|---------|------------|
| Module Not Found | `Can't resolve 'clsx'` | Always run `npm install` |
| Unused Imports | ESLint warnings | Remove unused imports immediately |
| Type Errors | TypeScript complaints | Run `npx tsc --noEmit` frequently |
| Build Failures | Next.js build errors | Test build after each feature |

### Checkpoint ✓

- [ ] Read all error documentation
- [ ] Understand common pitfalls
- [ ] Know how to prevent repeated mistakes

---

## Phase 4: Technical & Codebase Familiarization

- [ ] **Review `docs/ai-knowledge-base/tech-stack/`:** Check the required versions and approved libraries for all core technologies.
- [ ] **Explore the codebase:**
    - [ ] Analyze the directory structure (`/app`, `/components`, `/lib`, etc.)
    - [ ] Review the database schema in `prisma/schema.prisma`
    - [ ] Examine existing code to understand the current coding style and patterns

### Directory Structure Overview

```
habernexus-nextjs/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard pages
│   ├── haber/              # News article pages
│   ├── kategori/           # Category pages
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── articles/           # Article-related components
│   ├── home/               # Homepage components
│   └── layout/             # Layout components (Header, Footer)
├── lib/                    # Utility functions and constants
├── prisma/                 # Database schema
├── docs/                   # Documentation
│   ├── ai-agents/          # AI agent protocols
│   ├── ai-knowledge-base/  # Shared knowledge
│   └── ai-plans/           # Development plans
└── public/                 # Static assets
```

### Checkpoint ✓

- [ ] Understand the directory structure
- [ ] Know where to find components, pages, and utilities
- [ ] Reviewed the database schema

---

## Phase 5: Environment Verification (Final Check)

Before starting any development task, run this verification sequence:

```bash
# Full verification sequence
npm run build && echo "✓ Build passed" || echo "✗ Build failed"
npx tsc --noEmit && echo "✓ TypeScript passed" || echo "✗ TypeScript failed"
npm run lint && echo "✓ Lint passed" || echo "✗ Lint failed"
```

### Expected Results

- [ ] `npm run build` - Completes successfully
- [ ] `npx tsc --noEmit` - No output (no errors)
- [ ] `npm run lint` - No errors or warnings

If any check fails, **DO NOT proceed**. Fix the issue first or report it to the user.

---

## Quick Reference Card

### Verification Commands

```bash
npx tsc --noEmit     # TypeScript check
npm run lint         # ESLint check
npm run build        # Build test
npm run dev          # Development server
```

### Commit Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(auth): add Google OAuth login
```

### File Locations

| What | Where |
|------|-------|
| Error documentation | `docs/ai-knowledge-base/errors/` |
| Development plans | `docs/ai-plans/active/` |
| Tech versions | `docs/ai-knowledge-base/tech-stack/TECH_VERSIONS.md` |
| Learnings | `docs/ai-knowledge-base/learnings/` |

---

## Onboarding Complete Checklist

Before proceeding to the Research Phase, verify:

- [ ] Environment is set up and verified
- [ ] All documentation has been read
- [ ] Knowledge Base has been reviewed
- [ ] Codebase structure is understood
- [ ] Verification commands are memorized
- [ ] All checks pass

---

**You are now ready to select a task and begin the Research Phase as outlined in `WORKFLOW.md`.**

Remember: **Incremental development with verification** is the key to success. Make small changes, verify often, and document everything.
