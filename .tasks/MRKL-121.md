---
id: MRKL-121
title: add prune command spec for confirmation flow
type: test
status: todo
created: '2026-03-12'
parent: MRKL-116
---

## Description

Create src/commands/prune.spec.ts following close.spec.ts pattern. Mock logger (including logger.prompt for confirmation). Test: invalid date format triggers error exit, no matching archived tasks logs empty message, --force flag skips confirmation prompt, confirmation denied aborts without deleting, confirmation accepted calls executePrune and deletes files, and logger output messages match expected format.

## Acceptance Criteria

- [ ] prune.spec.ts exists as colocated sibling
- [ ] tests cover: invalid date triggers error and process.exit
- [ ] tests cover: no matching tasks logs empty message and returns
- [ ] tests cover: --force flag skips logger.prompt call
- [ ] tests cover: confirmation denied aborts without file deletion
- [ ] tests cover: confirmation accepted deletes archived task files
- [ ] all existing tests pass (pnpm test)
- [ ] pnpm lint && pnpm typecheck pass
