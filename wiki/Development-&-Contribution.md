# Development & Contribution

This page provides detailed information on coding standards, commit conventions, verification requirements, and the pull request process for HaberNexus.

---

## 1. Development Philosophy

### Incremental Development

HaberNexus follows an **incremental development** approach:

1. Make small, focused changes (1-2 files at a time)
2. Verify after each change
3. Commit frequently with descriptive messages
4. Document any issues encountered

### The Verification Loop

> ⚠️ **CRITICAL:** Run these commands after EVERY code change.

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check
npm run lint

# Build test
npm run build
```

If any command fails, fix the issue immediately before proceeding.

---

## 2. Coding Standards

### Language & Types

- **TypeScript:** All code must be written in TypeScript
- **No `any` types:** Avoid using `any` unless absolutely necessary
- **Explicit types:** Function parameters and return types should be explicitly typed

### Linting & Formatting

- **ESLint:** All code must pass ESLint checks (`npm run lint`)
- **Prettier:** All code must be formatted consistently

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserData` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| Types/Interfaces | PascalCase | `UserProfile` |

### File Organization

```
components/
├── articles/           # Article-related components
│   └── ArticleCard.tsx
├── home/               # Homepage components
│   └── HeroSection.tsx
└── layout/             # Layout components
    ├── Header.tsx
    └── Footer.tsx
```

---

## 3. Commit Conventions

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### Commit Format

```
type(scope): description

[optional body]

[optional footer]
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat(auth): add Google OAuth login` |
| `fix` | A bug fix | `fix(header): resolve mobile menu toggle` |
| `docs` | Documentation changes | `docs: update README installation steps` |
| `style` | Formatting changes | `style: fix indentation in Header.tsx` |
| `refactor` | Code restructuring | `refactor(utils): simplify date formatting` |
| `test` | Adding/updating tests | `test(auth): add login flow tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |

### Commit Best Practices

1. **One change per commit:** Each commit should represent a single logical change
2. **Descriptive messages:** Explain what changed and why
3. **Reference issues:** Include issue numbers when applicable (e.g., `fix(auth): resolve login bug #42`)

---

## 4. Verification Requirements

### Before Every Commit

Run the verification sequence:

```bash
# Quick verification
npx tsc --noEmit && npm run lint && npm run build
```

### Before Creating a Pull Request

Run the full verification:

```bash
# Clean build
rm -rf .next
npm run build

# All checks
npx tsc --noEmit
npm run lint

# Manual testing
npm run dev
# Test affected features in browser
```

### Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Feature works as expected in browser
- [ ] No console errors in browser

---

## 5. Pull Request Process

### Step 1: Prepare Your Work

1. Select an issue from GitHub Issues or create a new one
2. Create a branch following the naming convention:
   - `feature/issue-number-description` for new features
   - `fix/issue-number-description` for bug fixes
   - `docs/description` for documentation

### Step 2: Develop

1. Make changes incrementally
2. Verify after each change
3. Commit frequently with conventional commit messages

### Step 3: Pre-PR Verification

Run the full verification sequence:

```bash
rm -rf .next
npm run build
npx tsc --noEmit
npm run lint
npm run dev  # Test manually
```

### Step 4: Create Pull Request

1. Push your branch to GitHub
2. Create a Pull Request against `master`
3. Fill out the PR template completely
4. Link to the related issue

### Step 5: Code Review

1. Respond to feedback promptly
2. Make requested changes
3. Re-run verification after changes

### Step 6: Merge

Once approved, your PR will be merged into `master`.

---

## 6. For AI Agents

AI agents must follow additional protocols defined in:

- [AI_DEVELOPMENT_GUIDE.md](../AI_DEVELOPMENT_GUIDE.md) - Main guide
- [docs/ai-agents/WORKFLOW.md](../docs/ai-agents/WORKFLOW.md) - Detailed workflow
- [docs/ai-agents/QUALITY_CHECKLIST.md](../docs/ai-agents/QUALITY_CHECKLIST.md) - Quality requirements
- [docs/ai-agents/ONBOARDING.md](../docs/ai-agents/ONBOARDING.md) - Onboarding checklist

### Key AI Agent Requirements

1. **Read the Knowledge Base** before starting any task
2. **Follow the 8-phase development framework**
3. **Verify after every change** (not just at the end)
4. **Document all errors** in the Knowledge Base
5. **Update ROADMAP.md** when completing features

---

## 7. Quick Reference

### Verification Commands

```bash
npx tsc --noEmit     # TypeScript check
npm run lint         # ESLint check
npm run build        # Build test
npm run dev          # Development server
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` |
| Type errors | Fix the type mismatch |
| Unused imports | Remove the import |
| Build fails | Check error message, fix issue |

---

For more information, please refer to:
- [CONTRIBUTING.md](https://github.com/sata2500/habernexus-nextjs/blob/main/CONTRIBUTING.md)
- [AI_DEVELOPMENT_GUIDE.md](https://github.com/sata2500/habernexus-nextjs/blob/main/AI_DEVELOPMENT_GUIDE.md)
