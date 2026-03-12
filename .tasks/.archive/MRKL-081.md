---
id: MRKL-081
title: cli e2e — interactive list and edit flows
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-080
---

## Description

E2E tests for interactive list and edit TUI flows in `src/e2e/cli.spec.ts`. Uses `node-pty` via `spawnTui` harness with pre-seeded task files. List tests verify rendering and task selection. Edit tests verify pre-populated form data and task file updates after modification.

## Acceptance Criteria

- [x] test: list renders pre-seeded tasks (TEST-001 and TEST-002 visible)
- [x] test: selecting a task in list opens edit TUI (Edit Task header appears)
- [x] test: edit shows pre-populated form with task data (title visible)
- [x] test: modifying and submitting edit updates task file on disk
- [x] pnpm test passes
