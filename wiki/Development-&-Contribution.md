# Development & Contribution

This page provides detailed information on coding standards, commit conventions, and the pull request process for HaberNexus.

## 1. Coding Standards

- **TypeScript:** All code must be written in TypeScript.
- **ESLint:** All code must adhere to the ESLint rules defined in the project.
- **Prettier:** All code must be formatted with Prettier.
- **Naming Conventions:**
    - Files: `kebab-case` (e.g., `user-profile.tsx`)
    - Components: `PascalCase` (e.g., `UserProfile`)
    - Functions: `camelCase` (e.g., `getUserData`)

## 2. Commit Conventions

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### Commit Types

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools and libraries such as documentation generation

### Example

```
feat: Add dark theme support
```

## 3. Pull Request Process

1.  **Select an Issue:** Select an issue from the GitHub Issues page or create a new one.
2.  **Create a Branch:** Create a new branch for your work, following the naming convention in `CONTRIBUTING.md`.
3.  **Develop:** Make your changes and test them thoroughly.
4.  **Create a Pull Request:** Create a new pull request on GitHub and fill out the template.
5.  **Code Review:** Respond to feedback and make any necessary changes.
6.  **Merge:** Once your pull request is approved, it will be merged into the `main` branch.

For more information, please refer to the [CONTRIBUTING.md](https://github.com/sata2500/habernexus-nextjs/blob/main/CONTRIBUTING.md) file in the main repository.
