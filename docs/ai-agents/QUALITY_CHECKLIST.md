_# AI Agent Quality Checklist

**Objective:** To ensure every contribution meets the project's high standards for quality, consistency, and maintainability.

**You MUST verify every item on this checklist before creating a Pull Request. This is a non-negotiable phase.**

---

## 1. Code Quality & Standards

- [ ] **Linting:** The code passes all ESLint checks without any errors or warnings (`npm run lint`).
- [ ] **Formatting:** The code is formatted with Prettier (`npm run format`).
- [ ] **Type Safety:** The code is fully type-safe with no TypeScript `any` types unless absolutely necessary and justified.
- [ ] **Naming Conventions:** All files, variables, and functions adhere to the naming conventions specified in `CONTRIBUTING.md`.
- [ ] **No Magic Strings/Numbers:** All hardcoded strings or numbers are replaced with named constants.

## 2. Functionality & Correctness

- [ ] **Builds Successfully:** The project builds without errors (`npm run build`).
- [ ] **Runs Locally:** The application runs correctly in a local development environment (`npm run dev`).
- [ ] **Feature Works as Planned:** The implemented feature or fix behaves exactly as described in the development plan.
- [ ] **Edge Cases Handled:** Potential edge cases (e.g., empty inputs, invalid data, user errors) are handled gracefully.
- [ ] **No Regressions:** The changes do not break any existing functionality.

## 3. Testing & Verification

- [ ] **Testing Strategy Executed:** All tests defined in the development plan's "Testing Strategy" section have been executed.
- [ ] **Test Results Documented:** The results of all tests (both passed and failed) are documented in the development plan.
- [ ] **New Tests Added (if applicable):** New unit or integration tests have been added to cover the new code.

## 4. Documentation & Traceability

- [ ] **Code is Commented:** Complex or non-obvious parts of the code are explained with comments.
- [ ] **Development Plan is Complete:** The development plan file is fully filled out, including the "Error Log" and "Test Results" sections.
- [ ] **Knowledge Base Updated:** All new decisions, errors, or learnings have been documented in the `docs/ai-knowledge-base/`.
- [ ] **Project Documentation Updated:** Any user-facing documentation (`README.md`, `wiki/`, etc.) impacted by the changes has been updated.

## 5. Commit & Pull Request Hygiene

- [ ] **Conventional Commits:** All commit messages follow the Conventional Commits standard.
- [ ] **Clear PR Description:** The Pull Request description is clear, concise, and links to the relevant GitHub Issue and development plan file.
- [ ] **PR Includes All Necessary Files:** The PR includes the new code, the development plan, and any new knowledge base entries.

---

Only after every single one of these checks is complete are you permitted to open a Pull Request.
