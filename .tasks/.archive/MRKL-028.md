---
id: MRKL-028
title: interactive create broken
type: fix
status: closed
created: '2026-03-02'
---
## Description

Fix crash in interactive `mrkl create` when pressing Escape at the acceptance criteria prompt. `consola.prompt` returns `undefined` (not a Symbol) on Escape, but the AC loop only guarded against Symbol returns before calling `.trim()`, causing `Cannot read properties of undefined (reading 'trim')`.

The fix changes the guard from `typeof ac === "symbol"` to `typeof ac !== "string"`, which handles `undefined`, `null`, symbols, and any other non-string return type.

## Acceptance Criteria

- [ ] submitting no ACs by pressing Esc immediately at AC step should create task without error
- [ ] submitting one AC then pressing Esc should create task without error
- [ ] submitting two or more ACs then pressing Esc should create task without error
- [ ] test cases cover the undefined-return scenario matching real runtime behavior
