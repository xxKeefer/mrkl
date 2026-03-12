---
id: MRKL-117
title: add create command spec for cli-mode paths
type: test
status: todo
created: '2026-03-12'
parent: MRKL-116
---

## Description

Create src/commands/create.spec.ts following the pattern in close.spec.ts / done.spec.ts. Mock logger and TUI imports. Test the non-interactive CLI path: valid creation with type+title+flags, toStringArray comma splitting for --blocks, toOptionalString for --desc/--parent, toTaskType validation rejecting invalid types, error when only type given without title, and successful task creation verifying file on disk.

## Acceptance Criteria

- [ ] create.spec.ts exists as colocated sibling
- [ ] tests cover: valid non-interactive creation with all flags
- [ ] tests cover: error exit when only type provided without title
- [ ] tests cover: invalid task type triggers error and process.exit
- [ ] tests cover: --blocks comma-separated string splits correctly
- [ ] tests cover: --ac flag produces acceptance_criteria array
- [ ] all existing tests pass (pnpm test)
- [ ] pnpm lint && pnpm typecheck pass
