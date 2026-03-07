---
id: MRKL-038
title: add eslint and prettier configs to project
type: chore
status: in-progress
created: '2026-03-07'
---

## Description

Add ESLint (flat config) and Prettier to enforce consistent code style across the TypeScript codebase. Includes npm scripts and CLAUDE.md instructions to run them before committing.

## Acceptance Criteria

- [ ] ESLint flat config (`eslint.config.js`) with `@eslint/js` recommended + `typescript-eslint` recommended
- [ ] Prettier config (`.prettierrc`) with sensible defaults
- [ ] `.prettierignore` excludes `dist/`, `node_modules/`, `pnpm-lock.yaml`
- [ ] `package.json` has `lint`, `lint:fix`, and `format` scripts
- [ ] `CLAUDE.md` instructs to run `pnpm lint:fix && pnpm format` before committing
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm format` produces no changes (codebase already formatted)
- [ ] `pnpm test` still passes
