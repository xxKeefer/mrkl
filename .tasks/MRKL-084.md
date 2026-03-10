---
id: MRKL-084
title: use emoji constants for relationship indicators
type: fix
status: todo
created: '2026-03-10'
parent: MRKL-083
blocks:
  - MRKL-085
---

## Description

buildRelationshipIndicators in task.ts uses hardcoded ⛔► and ◄⛔ emojis. Replace with EMOJI.blocks (🚧) and EMOJI.blocked_by (🛑) from src/emoji.ts to stay consistent with the centralized emoji key.

## Acceptance Criteria

- [ ] buildRelationshipIndicators imports and uses EMOJI.blocks and EMOJI.blocked_by
- [ ] no hardcoded emoji characters remain in buildRelationshipIndicators
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
