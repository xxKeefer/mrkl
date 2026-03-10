---
id: MRKL-080
title: cli e2e — interactive create flow
type: test
status: todo
created: '2026-03-10'
parent: MRKL-056
blocks:
  - MRKL-079
---

## Description

Tier 3 e2e tests in tests/e2e/cli.spec.ts. Use node-pty to spawn 'tsx src/cli.ts create' interactively. Drive the full create flow: type a title, select a type, submit with Enter. Verify the task file is created in the temp .tasks/ dir with expected content. Capture and snapshot the final screen state.

## Acceptance Criteria

- [ ] test: interactive create flow produces correct task file
- [ ] test: task file frontmatter matches typed title and selected type
- [ ] test: final screen state is snapshotted
- [ ] pnpm test passes
