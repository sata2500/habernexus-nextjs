# HaberNexus AI Development Guide

**Version:** 3.0  
**Last Updated:** 26 December 2025  
**Status:** Active

---

## 1. Core Philosophy: The Unified Agent

This project is designed to be developed by multiple, independent AI agents working in concert. The ultimate goal is for all agents to act as a single, hyper-competent developer.

**Your primary directive is to maintain and enhance this unified workflow.**

### Guiding Principles

1.  **Incremental over monolithic:** Make small changes, verify after each. Never implement multiple features at once.
2.  **Verify constantly:** Run verification commands after every change, not just at the end.
3.  **Learn from the past:** Study the Knowledge Base before starting. Repeated mistakes are unacceptable.
4.  **Document everything:** Every error, every decision, every learning must be recorded.
5.  **Leave it better than you found it:** Your contribution must improve the project's overall quality.

### The Golden Rule

> ⚠️ **CRITICAL:** After EVERY code change, run:
> ```bash
> npx tsc --noEmit && npm run lint && npm run build
> ```
> If any command fails, fix immediately before proceeding.

---

## 2. The AI Agent Development Framework

To achieve the "Unified Agent" philosophy, a strict, 8-phase development framework has been established. Every development task you undertake **MUST** follow this framework. No phases may be skipped.

### The 8 Phases of Development

| Phase | Name | Description | Key Document |
|---|---|---|---|
| 1 | **Synchronization** | Onboard and align with the project's current state. | `docs/ai-agents/ONBOARDING.md` |
| 2 | **Research** | Investigate technologies and best practices. | `docs/ai-agents/WORKFLOW.md` |
| 3 | **Planning** | Create a detailed, verifiable development plan. | `docs/ai-plans/templates/PLAN_TEMPLATE.md` |
| 4 | **Implementation** | Write code incrementally with verification after each step. | `docs/ai-agents/WORKFLOW.md` |
| 5 | **Verification** | Rigorously test your code to ensure quality. | `docs/ai-agents/QUALITY_CHECKLIST.md` |
| 6 | **Publishing** | Submit your work for integration into the main branch. | `CONTRIBUTING.md` |
| 7 | **Documentation** | Update all relevant project and knowledge base documents. | `docs/ai-knowledge-base/` |
| 8 | **Cleanup** | Finalize your work and maintain a clean project state. | `docs/ai-agents/WORKFLOW.md` |

---

## 3. The Incremental Development Process

> This is the most important section. Failure to follow this process leads to compound errors and wasted time.

### The Verification Loop

```
┌─────────────────────────────────────────────────────────┐
│  For EVERY code change:                                 │
│                                                         │
│  1. Make ONE small change                               │
│  2. Run: npx tsc --noEmit                               │
│  3. Run: npm run lint                                   │
│  4. Run: npm run build                                  │
│  5. If ALL pass → Commit and continue                   │
│  6. If ANY fail → Fix immediately, document error       │
│  7. Repeat                                              │
└─────────────────────────────────────────────────────────┘
```

### Micro-Step Implementation

Each implementation should be broken into micro-steps:

| Micro-Step Size | Files Changed | Time | Verification |
|-----------------|---------------|------|--------------|
| Ideal | 1-2 files | 5-10 min | Full (tsc + lint + build) |
| Maximum | 3-4 files | 15 min | Full |
| Too Large | 5+ files | 20+ min | **Break it down!** |

### What Happens If You Skip Verification

```
Without verification:
  Change 1 → Change 2 → Change 3 → Change 4 → Build fails
  Result: Which change caused the error? Hours of debugging.

With verification:
  Change 1 → Verify ✓ → Change 2 → Verify ✗ → Fix immediately
  Result: Error caught and fixed in minutes.
```

---

## 4. The AI Agent Central Hub: `docs/ai-agents/`

All core instructions, protocols, and checklists for AI agents are located in the `docs/ai-agents/` directory.

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `ONBOARDING.md` | Environment setup and project familiarization | Before starting any task |
| `WORKFLOW.md` | Step-by-step development process | During every task |
| `QUALITY_CHECKLIST.md` | Verification requirements | After every change |
| `COMMUNICATION_PROTOCOL.md` | How to communicate with users | When reporting progress |

---

## 5. The Shared Brain: `docs/ai-knowledge-base/`

This is the collective memory of all agents who have worked on this project. **Reading this is MANDATORY.**

### Directory Structure

```
docs/ai-knowledge-base/
├── decisions/      # Architectural Decision Records (ADRs)
├── errors/         # Past errors and their solutions
├── learnings/      # Best practices and tips
└── tech-stack/     # Technology versions and requirements
```

### Why This Matters

| Without Knowledge Base | With Knowledge Base |
|------------------------|---------------------|
| Repeat same mistakes | Learn from past errors |
| Reinvent solutions | Build on existing work |
| Inconsistent decisions | Follow established patterns |
| Wasted time | Efficient development |

---

## 6. Quick Reference

### Verification Commands

```bash
# Run after EVERY change
npx tsc --noEmit     # TypeScript check
npm run lint         # ESLint check
npm run build        # Build test

# Run periodically
npm run dev          # Development server
```

### Commit Format (Conventional Commits)

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example: feat(auth): add Google OAuth login
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Dependencies not installed | Run `npm install` |
| `Type 'X' is not assignable` | TypeScript type mismatch | Fix the type |
| `'X' is defined but never used` | Unused import | Remove the import |
| Build fails | Various | Check error message, consult Knowledge Base |

---

## 7. Development Workflow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT DEVELOPMENT WORKFLOW                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ONBOARD                                                     │
│     └─ Read docs, verify environment, check Knowledge Base      │
│                                                                 │
│  2. PLAN                                                        │
│     └─ Break task into micro-steps, each with verification      │
│                                                                 │
│  3. IMPLEMENT (for each micro-step)                             │
│     ├─ Write code (1-2 files max)                               │
│     ├─ Verify: npx tsc --noEmit                                 │
│     ├─ Verify: npm run lint                                     │
│     ├─ Verify: npm run build                                    │
│     ├─ If fail: Fix and document                                │
│     └─ Commit with conventional message                         │
│                                                                 │
│  4. DOCUMENT                                                    │
│     ├─ Update ROADMAP.md                                        │
│     ├─ Add to Knowledge Base                                    │
│     └─ Update README if needed                                  │
│                                                                 │
│  5. REPORT                                                      │
│     └─ Inform user of progress and any issues                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Final Reminders

1. **Never skip verification.** It takes 30 seconds and saves hours.
2. **Read the Knowledge Base.** Past agents have solved your problems.
3. **Document your work.** Future agents will thank you.
4. **Ask for help.** If stuck after 2 attempts, ask the user.
5. **Small commits.** One change, one commit, one verification.

---

By strictly following this guide and its associated documents, you contribute not just code, but a structured, traceable, and intelligent process that elevates the entire project and all future contributors, both human and AI.
