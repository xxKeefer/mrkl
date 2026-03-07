---
id: MRKL-038
title: add eslint and prettier configs to project
type: chore
status: done
created: '2026-03-07'
flag: completed
---

## Description

Add ESLint (flat config) and Prettier to enforce consistent code style across the TypeScript codebase. Includes npm scripts and CLAUDE.md instructions to run them before committing.

## Acceptance Criteria

- [x] ESLint flat config (`eslint.config.js`) with `@eslint/js` recommended + `typescript-eslint` recommended
- [x] Prettier config (`.prettierrc`) with sensible defaults
- [x] `.prettierignore` excludes `dist/`, `node_modules/`, `pnpm-lock.yaml`
- [x] `package.json` has `lint`, `lint:fix`, and `format` scripts
- [x] `CLAUDE.md` instructs to run `pnpm lint:fix && pnpm format` before committing
- [x] `pnpm lint` passes with no errors
- [x] `pnpm format` produces no changes (codebase already formatted)
- [x] `pnpm test` still passes
