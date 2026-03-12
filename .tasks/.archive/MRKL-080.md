---
id: MRKL-080
title: cli e2e — interactive create flow
type: test
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
blocks:
  - MRKL-079
---

## Description

E2e tests for the interactive create TUI flow in `src/e2e/cli.spec.ts`. Uses `node-pty` via `spawnTui` harness to drive the full create form: navigate fields, type title, select type, submit with Enter. Verifies the resulting task file has correct frontmatter. Captures and snapshots the final screen state.

## Acceptance Criteria

- [x] test: interactive create flow produces correct task file (id, type, title, status)
- [x] test: task file frontmatter matches typed title and selected type (fix + custom title)
- [x] test: final screen state is snapshotted
- [x] pnpm test passes
