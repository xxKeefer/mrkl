---
id: MRKL-056
title: e2e and integration suite
type: test
status: done
created: '2026-03-09'
flag: completed
---

## Description

Add a three-tier testing infrastructure for TUI screens and CLI commands:

### Tier 1 — Render Snapshots (unit-level, fast)
- Extract/export `render()` functions from `create-tui.ts` and `list-tui.ts`
- Call with mock stdout (configurable columns/rows)
- Feed raw ANSI output through `@xterm/headless` to get the actual interpreted screen
- Snapshot the plain text screen buffer via `@xterm/addon-serialize`
- Test at 40, 80, 120 col widths

### Tier 2 — Keyboard Interaction Testing (integration-level)
- Use `node-pty` to spawn TUIs in a real pseudo-terminal
- Send keystrokes via PTY input (arrow keys, typing, Enter, Esc)
- Capture screen state at each step via xterm-headless
- Snapshot each interaction state

### Tier 3 — CLI E2E (full binary, slower)
- Spawn built CLI via `node-pty` or `child_process`
- Non-interactive commands: test stdout/stderr/exit code directly
- Interactive commands: use Tier 2 PTY approach
- Validate commands produce expected task files and state changes

### New Dependencies (devDependencies)
| Package | Purpose |
|---------|---------|
| `@xterm/headless` | Headless terminal emulator, interprets ANSI |
| `@xterm/addon-serialize` | Serialize screen buffer to plain text |
| `node-pty` | Real PTY for interaction/e2e tests |

### Key Refactors
- `create-tui.ts`: Export `FormState` interface + `render` function (2-line change)
- `list-tui.ts`: Extract `renderList` + helpers (`formatRow`, `colorizeRow`, `buildPreviewLines`, `wrapText`) from closure to module scope, export `ListRenderState` interface

### New Files
- `src/tui/tui-test-harness.ts` — `createMockStdout()`, `renderToScreen()` (xterm-headless wrapper), state factories
- `src/tui/list-tui.spec.ts` — Tier 1 + Tier 2 tests for list TUI
- `tests/e2e/cli.spec.ts` — Tier 3 CLI e2e tests

### Research Sources
- [Testing TUI apps](https://blog.waleedkhan.name/testing-tui-apps/)
- [@xterm/headless](https://www.npmjs.com/package/@xterm/headless)
- [@xterm/addon-serialize](https://www.npmjs.com/package/@xterm/addon-serialize)
- [node-pty](https://github.com/microsoft/node-pty)
- [@inquirer/testing](https://www.npmjs.com/package/@inquirer/testing) (pattern reference)

## Acceptance Criteria

- [x] `@xterm/headless`, `@xterm/addon-serialize`, `node-pty` installed as devDependencies
- [x] `tui-test-harness.ts` provides `createMockStdout`, `renderToScreen`, and state factories
- [x] `create-tui.ts` exports `FormState` and `render`
- [x] `list-tui.ts` refactored: `renderList` extracted to module scope, `ListRenderState` exported
- [x] Tier 1: create-tui render snapshots at 40/80/120 col (empty, filled, edit, error, autocomplete, wrapping)
- [x] Tier 1: list-tui render snapshots at 40/80/120 col (empty, epic grouping, blocking, archive tab, scroll, truncation)
- [x] Tier 2: create-tui interaction tests (navigate, cycle type, type text, submit, cancel, autocomplete)
- [x] Tier 2: list-tui interaction tests (navigate, search, tab switch, select, cancel)
- [x] Tier 3: CLI e2e for `create`, `list`, `edit`, `done`, `close` commands
- [x] Tier 3: non-interactive flag-based commands tested
- [x] All TUI screens tested at multiple terminal resolutions (40/80/120 cols)
- [x] Snapshot update workflow works via `pnpm test -- -u`
