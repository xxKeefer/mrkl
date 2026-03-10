---
id: MRKL-086
title: reorder preview to show relationships before description
type: fix
status: todo
created: '2026-03-10'
parent: MRKL-083
---

## Description

In buildPreviewLines in list-tui.ts, move the Relationships section above the Description section. Ensure blocks and blocked-by relationships are included in the preview.

## Acceptance Criteria

- [ ] preview shows Relationships section before Description section
- [ ] blocks and blocked-by relationships appear in preview
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
