---
id: MRKL-086
title: reorder preview to show relationships before description
type: fix
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-083
---

## Description

Reorder the preview pane in `buildPreviewLines` (list-tui.ts) so that the Relationships section (parent, children, blocks, blocked-by) renders immediately after the title header, before the Description section. This surfaces blocking information without scrolling.

## Acceptance Criteria

- [x] preview shows Relationships section before Description section
- [x] blocks and blocked-by relationships appear in preview
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
