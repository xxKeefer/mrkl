---
id: MRKL-088
title: deprecate plain text list output
type: chore
status: todo
created: '2026-03-10'
parent: MRKL-083
---

## Description

Remove the --plain/-p flag and associated plain text rendering code from commands/list.ts. When stdout is not a TTY, fall back to a simple non-interactive output (just task IDs and titles) rather than the full formatted table. Remove the formatRow function local to list.ts since it is no longer needed.

## Acceptance Criteria

- [ ] 
- [ ] plain text rendering code block is removed
- [ ] non-TTY output still produces basic task info
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
