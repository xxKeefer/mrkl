use pnpm
IMPORTANT: the latest version of mrkl can be called via: `pn dev <command> <flag>`, when using mrkl make sure to make it human readable by newline the flags with a \

IMPORTANT: when using skills that ask for a task tracker, use mrkl to attempt to perform the action. if it can not be done simulate the output and let the user know that mrkl is not feature complete

# MRKL Design Philosophy
- things should be simple. code, commands, config, files. all should be terse, precise, easy to use and read.
- if a human user has to think about it, then the design needs more work. using mrkl should be like breathing. intuitive and automatic
- our users are developers and ai agents, our features should be designed to make it easier for them to work together
- all mrkl commands should have an interactive tui mode if given no arguments for humans ease of use
- all mrkl commands should by default either print a success message or printout to the console when given commands for agents ease of use

# Architecture
- Entry point: `src/cli.ts` — citty `defineCommand` router with subcommands
- Commands: `src/commands/` — each exports a `defineCommand` (see `close.ts` for reference pattern)
- Core logic: `src/task.ts` (task CRUD + relationships), `src/id.ts` (temporal ID generation), `src/template.ts` (gray-matter frontmatter)
- Icons: `src/icons.ts` — single `ICONS` map of 1-cell-wide Unicode symbols, `getIcon()`, `priorityIcon()`, `statusIcon()`
- Logger: `src/logger.ts` — icon-prefixed logger wrapping consola, keyed by `IconKey`
- State: `src/state.ts` — persisted TUI preferences (`.tasks/.mrkl.json`)
- TUI: `src/tui/` — interactive prompts for commands invoked without arguments
- Types: `src/types.ts` — `TaskData`, `Status`, `TaskType`, `Priority`, `SortField`, etc.
- Tasks are markdown files with YAML frontmatter, stored in `.tasks/` (archived to `.tasks/.archive/`)
- Statuses: `todo | in-progress | done | closed`
- Task types: `feat | fix | chore | docs | perf | refactor | test | ci | build | style`

# Command Aliases
`i`=init, `c`=create, `ls`=list, `e`=edit, `d`=done, `p`=prune, `x`=close

# Testing
- Colocated `*.spec.ts` siblings, run with `pnpm test`
- TUI snapshot testing via `src/tui/tui-test-harness.ts` + `@xterm/headless` + `node-pty`
- CLI e2e tests in `src/e2e/cli.spec.ts`
- Verify: `pnpm lint && pnpm typecheck && pnpm test`
- NEVER use npx/direct tool invocations — always use pnpm scripts (pnpm test, pnpm test:update, pnpm lint, pnpm typecheck)

# Task Completion
- After implementation passes lint/typecheck/tests, run `pn dev done <TASK-ID>` before committing
