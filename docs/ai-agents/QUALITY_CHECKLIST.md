# AI Agent Quality Checklist

**Version:** 2.0  
**Last Updated:** 26 December 2025  
**Status:** Active

**Objective:** To ensure every contribution meets the project's high standards for quality, consistency, and maintainability.

**You MUST verify every item on this checklist before creating a Pull Request. This is a non-negotiable phase.**

---

## Quick Verification Commands

Run these commands frequently during development:

```bash
# TypeScript Check
npx tsc --noEmit

# ESLint Check
npm run lint

# Build Test
npm run build

# Development Server (manual testing)
npm run dev
```

---

## 1. Pre-Implementation Checks (Before Writing Code)

- [ ] **Dependencies Verified:** All required packages are listed in `package.json`
- [ ] **npm install Run:** `node_modules` folder exists and is populated
- [ ] **Environment Setup:** `.env` file exists (copied from `.env.example`)
- [ ] **Prisma Ready:** `npx prisma generate` has been run
- [ ] **Database Ready:** `npx prisma db push` has been run (for local development)

---

## 2. Per-Step Verification (After Each Micro-Step)

> ⚠️ **CRITICAL:** Run these checks after EVERY code change, not just at the end.

### 2.1 Immediate Checks (Run After Every Change)

- [ ] **TypeScript Check:** `npx tsc --noEmit` passes with no errors
- [ ] **No Import Errors:** All imports resolve correctly
- [ ] **No Unused Imports:** Remove any imports that are not used

### 2.2 Periodic Checks (Run Every 2-3 Changes)

- [ ] **Linting:** `npm run lint` passes without errors or warnings
- [ ] **Build Test:** `npm run build` completes successfully

### 2.3 Milestone Checks (Run After Completing a Feature)

- [ ] **Dev Server Test:** `npm run dev` starts without errors
- [ ] **Browser Test:** Application loads correctly at `http://localhost:3000`
- [ ] **Feature Test:** New feature works as expected

---

## 3. Code Quality & Standards

### 3.1 TypeScript & Types

- [ ] **Type Safety:** No TypeScript `any` types unless absolutely necessary and justified
- [ ] **Explicit Types:** Function parameters and return types are explicitly typed
- [ ] **No Type Errors:** `npx tsc --noEmit` produces no output

### 3.2 ESLint & Formatting

- [ ] **Linting Passes:** `npm run lint` shows no errors
- [ ] **No Warnings:** All ESLint warnings are addressed
- [ ] **Consistent Formatting:** Code follows project formatting standards

### 3.3 Code Organization

- [ ] **Naming Conventions:** All files, variables, and functions follow conventions in `CONTRIBUTING.md`
- [ ] **No Magic Strings/Numbers:** Hardcoded values are replaced with named constants
- [ ] **No Duplicate Code:** Common logic is extracted into reusable functions
- [ ] **Proper File Structure:** New files are placed in appropriate directories

---

## 4. Functionality & Correctness

### 4.1 Build & Runtime

- [ ] **Builds Successfully:** `npm run build` completes without errors
- [ ] **No Build Warnings:** Build warnings are addressed or documented
- [ ] **Runs Locally:** `npm run dev` starts the application correctly
- [ ] **No Console Errors:** Browser console shows no errors

### 4.2 Feature Completeness

- [ ] **Feature Works as Planned:** Implementation matches the development plan
- [ ] **Edge Cases Handled:** Empty inputs, invalid data, and errors are handled gracefully
- [ ] **No Regressions:** Existing functionality still works correctly
- [ ] **Responsive Design:** UI works on different screen sizes (if applicable)

---

## 5. Error Handling & Documentation

### 5.1 Error Handling

- [ ] **Errors Caught:** Potential errors are caught and handled appropriately
- [ ] **User-Friendly Messages:** Error messages are helpful and actionable
- [ ] **Logging:** Errors are logged for debugging purposes

### 5.2 Code Documentation

- [ ] **Comments Added:** Complex or non-obvious code is explained with comments
- [ ] **JSDoc Comments:** Public functions have JSDoc documentation
- [ ] **README Updated:** Any setup changes are reflected in README.md

### 5.3 Knowledge Base Updates

- [ ] **Errors Documented:** Any novel errors encountered are documented in `docs/ai-knowledge-base/errors/`
- [ ] **Learnings Recorded:** New best practices are added to `docs/ai-knowledge-base/learnings/`
- [ ] **Decisions Recorded:** Architectural decisions are documented as ADRs

---

## 6. Git & Version Control

### 6.1 Commit Hygiene

- [ ] **Conventional Commits:** All commit messages follow the format: `type(scope): description`
- [ ] **Atomic Commits:** Each commit represents a single, logical change
- [ ] **No Large Commits:** Commits are small and focused

### 6.2 Branch & PR

- [ ] **Correct Branch:** Working on the correct feature branch
- [ ] **Up to Date:** Branch is up to date with `main`/`master`
- [ ] **PR Description:** Pull Request has a clear, comprehensive description
- [ ] **Files Included:** All necessary files (code, docs, plans) are included

---

## 7. Final Verification Sequence

Before creating a Pull Request, run this complete sequence:

```bash
# 1. Clean build
rm -rf .next
npm run build

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Start dev server and test manually
npm run dev
# Open http://localhost:3000 and test all affected features

# 5. Git status check
git status
git diff --stat
```

### Final Checklist

- [ ] All verification commands pass
- [ ] Manual testing completed
- [ ] Development plan updated with test results
- [ ] All documentation updated
- [ ] Ready for Pull Request

---

## Common Issues & Solutions

### Issue: Module Not Found

```
Module not found: Can't resolve 'package-name'
```

**Solution:**
1. Verify package is in `package.json`
2. Run `npm install`
3. Restart dev server

### Issue: TypeScript Error

```
Type 'X' is not assignable to type 'Y'
```

**Solution:**
1. Check the expected type
2. Fix the type mismatch
3. Run `npx tsc --noEmit` to verify

### Issue: ESLint Error - Unused Import

```
'Component' is defined but never used
```

**Solution:**
1. Remove the unused import
2. Or comment it out if planned for future use: `// import { Component } from 'package'`

### Issue: Build Fails

**Solution:**
1. Read the error message carefully
2. Check `docs/ai-knowledge-base/errors/` for known issues
3. Fix the specific error
4. Run `npm run build` again

---

## Verification Frequency Guide

| Action | When to Verify |
|--------|----------------|
| `npx tsc --noEmit` | After every file change |
| `npm run lint` | After every 2-3 changes |
| `npm run build` | After completing a component/feature |
| `npm run dev` | Before committing |
| Full sequence | Before creating PR |

---

**Remember:** Quality is not negotiable. Every check on this list exists because skipping it has caused problems in the past. Take the time to verify properly.
