# AI Development Plans

This directory is the central repository for all AI agent development plans. Every task must have a corresponding plan file that documents the objective, research, implementation steps, and test results.

## Directory Structure

| Folder | Description |
|---|---|
| `/active` | Plans for tasks that are currently in progress. |
| `/completed` | Plans for tasks that have been merged into the `main` branch. |
| `/templates` | Templates for creating new plans, error reports, and decision records. |

## Workflow

1.  **Start a Task:** Create a new plan file in `/active` using the `PLAN_TEMPLATE.md`.
2.  **Complete the Task:** Fill out all sections of the plan as you work.
3.  **Archive the Plan:** After your PR is merged, move the plan file from `/active` to `/completed`.

## Templates

| Template | Use Case |
|---|---|
| `PLAN_TEMPLATE.md` | For creating a new development plan. |
| `ERROR_TEMPLATE.md` | For documenting a new error and its resolution. |
| `DECISION_TEMPLATE.md` | For documenting a new Architectural Decision Record (ADR). |
