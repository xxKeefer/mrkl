---
id: MRKL-084
title: use emoji constants for relationship indicators
type: fix
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-083
blocks:
  - MRKL-085
---

## Description

Replace hardcoded ⛔► and ◄⛔ emojis in `buildRelationshipIndicators` (`src/task.ts`) with `EMOJI.blocks` (🚧) and `EMOJI.blocked_by` (🛑) from `src/emoji.ts` for consistency with the centralized emoji key.

## Acceptance Criteria

- [x] buildRelationshipIndicators imports and uses EMOJI.blocks and EMOJI.blocked_by
- [x] no hardcoded emoji characters remain in buildRelationshipIndicators
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
