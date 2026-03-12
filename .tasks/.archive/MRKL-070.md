---
id: MRKL-070
title: extract renderlist and helpers from list-tui.ts closure
type: refactor
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
---

## Description

Refactor src/tui/list-tui.ts to extract functions currently nested inside interactiveList closure to module scope: formatRow (line 196), colorizeRow (line 215), buildPreviewLines (line 235), wrapText (line 291). Define and export a ListRenderState interface capturing the render-relevant state (entries, selectedIndex, scrollOffset, searchQuery, activeTab, cols, rows, etc). Export a new renderList(state, stdout) function that the closure's render() delegates to. Also export FzfEntry and buildEntries. The closure render() becomes a one-liner: renderList(stateObj, stdout).

## Acceptance Criteria

- [x] formatRow, colorizeRow, buildPreviewLines, wrapText are module-scope functions
- [x] ListRenderState interface is exported
- [x] renderList(state, stdout) is exported and callable independently
- [x] FzfEntry type and buildEntries function are exported
- [x] interactiveList still works — no behavior change
- [x] pnpm typecheck and pnpm test pass
