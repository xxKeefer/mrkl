---
id: MRKL-092
title: add priority types and emoji constants
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-091
blocks:
  - MRKL-093
  - MRKL-094
  - MRKL-095
  - MRKL-096
---

## Description

Add PRIORITIES const array [1,2,3,4,5] and Priority type to types.ts. Add priority_lowest (⏬), priority_low (🔽), priority_normal (⏹️), priority_high (🔼), priority_highest (⏫) to EMOJI in emoji.ts. Add optional priority field (default 3) to TaskData, CreateTaskOpts, and EditTaskResult interfaces. Add a priorityEmoji helper that maps numeric priority to its emoji.

## Acceptance Criteria

- [ ] PRIORITIES const and Priority type exported from types.ts
- [ ] priority field added to TaskData as optional number defaulting to 3
- [ ] priority field added to CreateTaskOpts as optional number
- [ ] priority field added to EditTaskResult as optional number
- [ ] five priority emoji keys added to EMOJI in emoji.ts
- [ ] priorityEmoji helper maps 1-5 to correct emoji
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
