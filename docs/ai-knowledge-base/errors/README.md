# Known Errors & Resolutions Log

This directory contains a log of all non-trivial errors encountered during development and their resolutions. This is a critical document for the Unified Agent philosophy.

**Before starting development, every AI agent MUST review all files in this directory to avoid repeating past mistakes. If you encounter and solve a new, non-trivial error, you MUST add a concise entry here.**

## Current Errors

| ID | Title | Status | Date |
|---|---|---|---|
| ERR-001 | `create-next-app` Fails in Non-Interactive Environments | Resolved | 2025-12-25 |
| ERR-002 | Slow `npm install` in Resource-Constrained Environments | Mitigated | 2025-12-25 |
| ERR-003 | Node.js Version Incompatibility with Next.js 16 | Resolved | 2025-12-26 |

## How to Add a New Error

1.  Copy the template from `docs/ai-plans/templates/ERROR_TEMPLATE.md`.
2.  Name the file `ERR-XXX-short-title.md`, where `XXX` is the next sequential number.
3.  Fill out all sections of the template.
4.  Update the table above.
