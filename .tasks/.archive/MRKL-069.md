---
id: MRKL-069
title: export formstate and render from create-tui.ts
type: refactor
status: done
created: '2026-03-10'
flag: completed
parent: MRKL-056
---

## Description

Export the FormState interface (line 63) and the render function (line 348) from src/tui/create-tui.ts. Currently these are not exported. This is a 2-line change — add 'export' keyword to each. No logic modifications. Required so snapshot tests can call render() directly with mock state and stdout.

## Acceptance Criteria

- [x] FormState interface is exported from create-tui.ts
- [x] render function is exported from create-tui.ts
- [x] no logic changes — existing tests still pass
- [x] pnpm typecheck passes
