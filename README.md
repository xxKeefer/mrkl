<p align="center">
  <h1 align="center">mrkl</h1>
  <p align="center">
    📝 <i>mrkl, rhymes with sparkle</i> ✨
    <br />
    Lightweight CLI for structured markdown task tracking.
    <br />
    Track work in your repo, not in a separate app.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@xxkeefer/mrkl"><img src="https://img.shields.io/npm/v/@xxkeefer/mrkl" alt="npm version" /></a>
  <a href="https://github.com/xxKeefer/mrkl/blob/main/LICENSE"><img src="https://img.shields.io/github/license/xxKeefer/mrkl" alt="license" /></a>
  <a href="https://github.com/xxKeefer/mrkl"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>

---

## Why mrkl? 🤔

Most task trackers live outside your codebase. mrkl keeps tasks as markdown files right alongside your code — version-controlled, greppable, and readable by both humans and AI agents.

- 🗂️ **No external service** — tasks live in `.tasks/` as structured markdown
- 🌿 **Git-native** — commit, branch, and diff your tasks like any other file
- 🤖 **AI-agent friendly** — consistent YAML frontmatter makes tasks easy to parse programmatically
- 📏 **Conventional commits vocabulary** — task types mirror what you already use (`feat`, `fix`, `chore`, etc.)
- ⚡ **Zero config** — one command to set up, sensible defaults for everything

## Install 📦

```sh
pnpm add -g @xxkeefer/mrkl
```

Or use without installing:

```sh
npx @xxkeefer/mrkl init
```

## Quick Start 🚀

```sh
# Initialize in your project root
mrkl init

# Create tasks (IDs are generated automatically as temporal base36)
mrkl create feat "user authentication"
mrkl create fix "login redirect loop" --desc "Users get stuck after OAuth callback"
mrkl create feat "dark mode" --ac "toggle in settings" --ac "persists across sessions"
mrkl create fix "critical bug" --priority 5    # highest priority

# View active tasks
mrkl list
# fub-09a3k1  feat  todo  user authentication
# fub-09a3k2  fix   todo  login redirect loop
# fub-09a3k3  feat  todo  dark mode

# Filter by type or status
mrkl list --type fix
mrkl list --status todo

# Mark tasks as done and archive them
mrkl done fub-09a3k1

# All commands have short aliases
mrkl c feat "dark mode"           # create
mrkl e fub                        # edit (prefix match)
mrkl ls --type fix                # list
mrkl d fub-09a3k1                 # done
mrkl x fub-09a3k2                 # close
mrkl x fub-09a3k2 -r "duplicate" # close with reason
```

## Commands 🛠️

| Command                 | Alias | Description                                                       |
| ----------------------- | ----- | ----------------------------------------------------------------- |
| `init`                  | `i`   | Initialize mrkl in the current project                            |
| `create`                | `c`   | Create a new task                                                 |
| `edit`                  | `e`   | Edit an existing task in an interactive TUI                       |
| `list`                  | `ls`  | List active tasks (selecting a task opens the edit TUI)           |
| `done`                  | `d`   | Mark task(s) as done and archive them                             |
| `close`                 | `x`   | Close task(s) (won't do, duplicate, etc.) and archive them        |
| `prune`                 | `p`   | Delete archived tasks created on or before a given date           |
| `migrate_prior_verbose` | —     | Migrate legacy verbose-filename tasks to frontmatter-based format |
| `install-skills`        | —     | Install bundled Claude Code skills                                |

### `mrkl init`

Initializes mrkl in the current directory.

Creates:

- `.tasks/` — active task directory
- `.tasks/.archive/` — completed task storage

Safe to run multiple times — existing directories are preserved.

### `mrkl create <type> <title> [options]`

Creates a new task file.

| Argument | Description                               |
| -------- | ----------------------------------------- |
| `type`   | Task type (see [Task Types](#task-types)) |
| `title`  | Short description of the task             |

| Option              | Alias | Description                              |
| ------------------- | ----- | ---------------------------------------- |
| `--desc <text>`     | `-d`  | Detailed description                     |
| `--ac <text>`       | `-a`  | Acceptance criterion (repeatable)        |
| `--priority <1-5>`  | `-P`  | Priority: 1=lowest, 3=normal, 5=highest |

```sh
mrkl create feat "search functionality" \
  --desc "Full-text search across all documents" \
  --ac "search bar in header" \
  --ac "results update as you type" \
  --ac "highlights matching terms" \
  --priority 4
```

Running `mrkl create` with no arguments enters **interactive mode**, prompting for type, title, description, and acceptance criteria.

### `mrkl edit [id]`

Opens an existing task in an interactive TUI form for editing type, status, title, description, and acceptance criteria.

| Argument | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| `id`     | Task ID or unique prefix (e.g., `fub-09a3k1` or `fub`). Optional.              |

When called without an ID, opens the list TUI to select a task first.

```sh
# Edit a specific task
mrkl edit fub-09a3k1
mrkl e fub

# Pick from list, then edit
mrkl edit
```

**TUI controls:**

| Key       | Action                                  |
| --------- | --------------------------------------- |
| `↑` / `↓` | Navigate between fields                |
| `←` / `→` | Cycle type/status, or move cursor      |
| `Ctrl+N`  | Insert newline in text fields           |
| `Enter`   | Submit (on last field) or next field    |
| `Esc`     | Cancel without saving                   |

### `mrkl list [options]`

Lists all active tasks.

| Option              | Alias | Description                                      |
| ------------------- | ----- | ------------------------------------------------ |
| `--type <type>`     | `-t`  | Filter by task type                              |
| `--status <status>` | `-s`  | Filter by status (`todo`, `in-progress`, `done`) |
| `--plain`           | `-p`  | Plain text output (no interactive TUI)            |

In interactive mode (default when stdout is a TTY), selecting a task with `Enter` opens the edit TUI. Non-conforming markdown files in the tasks directory are silently skipped.

### `mrkl done <id...>`

Marks one or more tasks as done and archives them.

| Argument | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| `id`     | Task ID(s) or unique prefixes to mark done                                     |

Sets the task status to `done`, writes `flag: completed` in frontmatter, auto-checks all acceptance criteria (`- [x]`), and moves the file to `.tasks/.archive/`.

```sh
# Mark a single task as done
mrkl done fub-09a3k1

# Mark multiple tasks
mrkl d fub-09a3k1 fub-09a3k2
```

### `mrkl close <id...> [options]`

Closes one or more tasks that won't be done — duplicates, out-of-scope work, etc.

| Argument | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| `id`     | Task ID(s) or unique prefixes to close                                         |

| Option            | Alias | Description                                        |
| ----------------- | ----- | -------------------------------------------------- |
| `--reason <text>` | `-r`  | Reason for closing (e.g., `duplicate`, `won't do`) |

Sets the task status to `closed`, writes the reason as a `flag` in frontmatter (if provided), and moves the file to `.tasks/.archive/`.

```sh
# Close a single task
mrkl close fub-09a3k2

# Close with a prefix match
mrkl x fub

# Close multiple tasks with a reason
mrkl x fub-09a3k3 fub-09a3k4 -r "out of scope"
```

### `mrkl prune <date> [options]`

Permanently deletes archived tasks created on or before a cutoff date.

| Argument | Description                              |
| -------- | ---------------------------------------- |
| `date`   | Cutoff date (`YYYY-MM-DD` or `YYYYMMDD`) |

| Option    | Alias | Description              |
| --------- | ----- | ------------------------ |
| `--force` | `-f`  | Skip confirmation prompt |

Shows a confirmation prompt listing tasks to be deleted unless `--force` is used.

```sh
# Delete archived tasks from January or earlier
mrkl prune 2026-01-31

# Skip confirmation
mrkl prune 2026-01-31 --force
```

### `mrkl migrate_prior_verbose`

Migrates task files from the legacy verbose-filename format to the current format. This is a **one-time migration** for projects that were using mrkl before v0.4.0.

**What it does:**

1. Scans all task files in `.tasks/` and `.tasks/.archive/`
2. Extracts the title from the verbose filename (e.g., `PROJ-001 feat - user auth.md`)
3. Writes the title into YAML frontmatter
4. If `verbose_files = false` (default): renames files to short format (`PROJ-001.md`)
5. If `verbose_files = true`: keeps verbose filenames as-is

```sh
mrkl migrate_prior_verbose
# ✅ Migrated 12 file(s), skipped 3 file(s).
```

> **Note:** After upgrading to v0.4.0+, existing task files will fail to parse until migrated. Run this command once to fix them.

### `mrkl install-skills`

Installs bundled Claude Code skills into the current project.

Copies skill directories from the mrkl package into `.claude/skills/` so they are available to Claude Code agents working in this project.

```sh
mrkl install-skills
# 🧩 Installed plan-from-task
```

Currently ships with:

| Skill            | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `plan-from-task` | Generate and execute implementation plans from mrkl task files |

## Task Types 🏷️

mrkl uses [conventional commit](https://www.conventionalcommits.org/) types:

| Type       | Purpose                 |
| ---------- | ----------------------- |
| `feat`     | New feature             |
| `fix`      | Bug fix                 |
| `chore`    | Maintenance             |
| `docs`     | Documentation           |
| `perf`     | Performance improvement |
| `refactor` | Code restructuring      |
| `test`     | Testing                 |
| `ci`       | CI/CD changes           |
| `build`    | Build system changes    |
| `style`    | Code style/formatting   |

## Priority 🎯

Tasks have a numeric priority from 1 (lowest) to 5 (highest). Default is `3` (normal).

| Priority | Label    | Emoji |
| -------- | -------- | ----- |
| 1        | lowest   | ⏬    |
| 2        | low      | 🔽    |
| 3        | normal   | ⏹️    |
| 4        | high     | 🔼    |
| 5        | highest  | ⏫    |

Set priority on create with `--priority` / `-P`:

```sh
mrkl create fix "critical bug" -P 5
mrkl create chore "update deps" -P 1
```

Priority is stored as `priority: <1-5>` in task frontmatter and displayed as an emoji in the list view status column and preview panel.

## Task File Format 📄

Each task is a markdown file with YAML frontmatter. Filenames use the temporal ID:

```
.tasks/fub-09a3k1.md
```

```markdown
---
id: fub-09a3k1
title: user authentication
type: feat
status: todo
priority: 3
created: '2026-03-20'
---

## Description

Implement user authentication with OAuth2.

## Acceptance Criteria

- [ ] login page renders
- [ ] OAuth flow completes
- [ ] session persists across refreshes
```

Use `mrkl edit <id>` to update type, status, title, description, or acceptance criteria via an interactive TUI, or edit task files directly.

## Project Structure 🗂️

After initialization, mrkl adds the following to your project:

```
your-project/
  .tasks/
    fub-09a3k1.md
    fub-09a3k2.md
    .archive/
      fub-08z1a0.md
```

Commit `.tasks/` to version control. It's designed to be tracked alongside your code.

## Team Workflow 👥

mrkl uses temporal base36 IDs (`ddd-mmmmmm` — days since epoch + milliseconds since midnight). IDs are generated from timestamps, so collisions are near-impossible even when multiple developers create tasks concurrently on different branches. No counter, no config, no sync — just create tasks anywhere and merge.

## Emoji Keys 🎨

All CLI output uses a centralized emoji map (`src/emoji.ts`) via a custom logger. Each key maps to a consola log level and auto-prefixes messages with the corresponding emoji.

| Emoji | Key                | Level     |
| ----- | ------------------ | --------- |
| 🟢    | `success`          | `success` |
| 🔴    | `error`            | `error`   |
| ⚠️    | `warn`             | `warn`    |
| ℹ️    | `info`             | `info`    |
| ✅    | `done`             | `success` |
| ❌    | `closed`           | `info`    |
| 🚧    | `blocks`           | `info`    |
| 🛑    | `blocked_by`       | `info`    |
| 📝    | `create`           | `success` |
| ✏️    | `update`           | `success` |
| 🧹    | `delete`           | `success` |
| 📭    | `empty`            | `info`    |
| 🎉    | `celebrate`        | `success` |
| 🧩    | `module`           | `success` |
| ✌️    | `quit`             | `info`    |
| 🔎    | `found`            | `info`    |
| ❓    | `not_found`        | `info`    |
| 🚩    | `flag`             | `info`    |
| ✴️    | `epic`             | `info`    |
| ❇️    | `child`            | `info`    |
| ⏬    | `priority_lowest`  | `info`    |
| 🔽    | `priority_low`     | `info`    |
| ⏹️    | `priority_normal`  | `info`    |
| 🔼    | `priority_high`    | `info`    |
| ⏫    | `priority_highest` | `info`    |

## Development 🧑‍💻

```sh
git clone https://github.com/xxKeefer/mrkl.git
cd mrkl
pnpm install

# Run tests
pnpm test

# Run CLI in development
pnpm tsx src/cli.ts list

# Build
pnpm build
```

## Contributing 🤝

Contributions are welcome! See **[CONTRIBUTING.md](CONTRIBUTING.md)** for branch protection rules, merge strategy, and development setup.

## License 📜

[MIT](LICENSE)
