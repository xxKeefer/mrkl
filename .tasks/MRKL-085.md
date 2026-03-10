---
id: MRKL-085
title: restructure list columns and fix overflow
type: refactor
status: todo
created: '2026-03-10'
parent: MRKL-083
blocks:
  - MRKL-089
---

## Description

Overhaul the column layout in list-tui.ts: remove the TYPE column, insert a blocking relationships column (using EMOJI indicators) between STATUS and TITLE, tighten column spacing to remove excess padding, cap the TITLE column at ~30 chars with ellipsis truncation, and ensure relationship indicators render within row bounds instead of overflowing into the preview pane. Update formatRow, colorizeRow, and the render loop accordingly. Also update the column header row.

## Acceptance Criteria

- [ ] TYPE column is removed from list rows and header
- [ ] blocking relationship indicators appear between STATUS and TITLE columns
- [ ] relationship indicators do not overflow into the preview pane
- [ ] title is truncated with ellipsis when exceeding column width
- [ ] column spacing is compact with no excessive gaps
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
