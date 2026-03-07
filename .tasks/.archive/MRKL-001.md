---
id: MRKL-001
title: implement config module
type: feat
status: todo
created: '2026-03-01'
---
## Description

Implement the config module (`src/config.ts`) that reads and writes `mrkl.toml` configuration files. The module should handle loading existing configs, creating new configs idempotently, applying defaults, and validating required fields.

## Acceptance Criteria

- [ ] `loadConfig(dir)` reads `mrkl.toml` from the given directory and returns a `Config` object
- [ ] `loadConfig(dir)` throws a clear error if `mrkl.toml` is not found
- [ ] `loadConfig(dir)` applies default `tasks_dir` of `".tasks"` when not specified
- [ ] `initConfig(dir, opts)` creates `mrkl.toml`, `.tasks/` directory, `.tasks/.archive/` directory, and `mrkl_counter`
- [ ] `initConfig(dir, opts)` is idempotent — does not overwrite existing config or reset counter
