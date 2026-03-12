---
id: MRKL-085
title: restructure list columns and fix overflow
type: refactor
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-083
blocks:
  - MRKL-089
---

## Description

Overhaul the column layout in list-tui.ts: remove the TYPE column, insert a blocking relationships column (using EMOJI indicators) between STATUS and TITLE, tighten column spacing to remove excess padding, cap the TITLE column at ~30 chars with ellipsis truncation, and ensure relationship indicators render within row bounds instead of overflowing into the preview pane. Update formatRow, colorizeRow, and the render loop accordingly. Also update the column header row.

### Example
the following snippet is the terminal outout form the list tui in this project

```md
ID            TYPE        STATUS        TITLE                                   │ Preview
────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────
MRKL-083      feat        todo          list view overhaul                      │ MRKL-085 refactor todo
├─MRKL-085      refactor    todo          restructure list columns and fix ove… 🚧 MRKL-089│ restructure list columns and fix overflow
├─MRKL-086      fix         todo          reorder preview to show relationship…│
├─MRKL-087      feat        todo          loop back to list view after edit ex… 🚧 MRKL-089│ Description
├─MRKL-088      chore       todo          deprecate plain text list output     │ Overhaul the column layout in list-tui.ts: remove the TYPE
├─MRKL-089      feat        todo          live file watching for list view      🛑 MRKL-085, MRKL-087│ column, insert a blocking relationships column (using EMOJI
MRKL-091      feat        todo          task priority system                    │ indicators) between STATUS and TITLE, tighten column spacing to
├─MRKL-092      feat        todo          add priority types and emoji constan… 🚧 MRKL-093, MRKL-094, MRKL-095, MRKL-096│ remove excess padding, cap the TITLE column at ~30 chars with
├─MRKL-093      feat        todo          add priority to template render and … 🚧 MRKL-094, MRKL-095 🛑 MRKL-092│ ellipsis truncation, and ensurerelationship indicators render
├─MRKL-094      feat        todo          add priority flag to create command … 🚧 MRKL-097 🛑 MRKL-092, MRKL-093│ within row bounds instead of overflowing into the preview pane.
├─MRKL-095      feat        todo          add priority to edit interactive tui  🚧 MRKL-097 🛑 MRKL-092, MRKL-093│ Update formatRow, colorizeRow, and the render loop accordingly.
├─MRKL-096      feat        todo          show priority in list view and previ… 🚧 MRKL-097 🛑 MRKL-092│ Also update the column header row.
├─MRKL-097      docs        todo          update documentation for priority sy… 🛑 MRKL-094, MRKL-095, MRKL-096│
MRKL-015      feat        todo          figure out how to handle merge conflicts│ Relationships
MRKL-017      feat        todo          ai navigable tasks folder               │   Parent: MRKL-083
MRKL-026      feat        todo          allow multiplayer planning flow         │   Blocks: MRKL-089
MRKL-034      docs        todo          document alternate 'companion repo' wor…│
MRKL-041      feat        todo          create function should default to feat …│ Acceptance Criteria
MRKL-046      chore       todo          remove migration script                 │ - [ ] TYPE column is removed from list rows and header
MRKL-048      feat        todo          add plan type                           │ - [ ] blocking relationship indicators appear between STATUS and
MRKL-061      test        todo          create command unit tests               │ TITLE columns
MRKL-062      refactor    todo          decompose create-tui into focused modul…│ - [ ] relationship indicators do not overflow into the preview
MRKL-063      feat        todo          import and export tasks                 │ pane
MRKL-064      feat        todo          subtasking                              │ - [ ] title is truncated with ellipsis when exceeding column
MRKL-090      fix         todo          edit command should support modifying r…│ width
MRKL-098      fix         todo          flag field not exposed in create-edit c…│ - [ ] column spacing is compact with no excessive gaps
MRKL-099      feat        todo          doctor command for task file healing    │ - [ ] existing tests pass (pnpm test)
MRKL-100      fix         todo          mrkl help command version               │ - [ ] typecheck passes (pnpm typecheck)
MRKL-101      feat        todo          warn of update                          │
MRKL-103      fix         todo          editing parent in tui broken            │
                                                                                │
                                                                                │
────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────
30/30 tasks  ↑↓: navigate  Tab: switch  Enter: select  Esc: quit  Type to search

```

## Acceptance Criteria

- [x] TYPE column is removed from list rows and header
- [x] blocking relationship indicators appear between STATUS and TITLE columns
- [x] relationship indicators do not overflow into the preview pane
- [x] title is truncated with ellipsis when exceeding column width
- [x] column spacing is compact with no excessive gaps
- [x] existing tests pass (pnpm test)
- [x] typecheck passes (pnpm typecheck)
