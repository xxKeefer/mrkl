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
npx @xxkeefer/mrkl init MY_PROJECT
```

## Quick Start 🚀

```sh
# Initialize in your project root
mrkl init PROJ

# Create tasks
mrkl create feat "user authentication"
mrkl create fix "login redirect loop" --desc "Users get stuck after OAuth callback"
mrkl create feat "dark mode" --ac "toggle in settings" --ac "persists across sessions"

# View active tasks
mrkl list
# PROJ-001  feat  todo  user authentication
# PROJ-002  fix   todo  login redirect loop
# PROJ-003  feat  todo  dark mode

# Filter by type or status
mrkl list --type fix
mrkl list --status todo

# Mark tasks as done and archive them
mrkl done PROJ-001
mrkl done 1 2 3            # multiple tasks, numeric IDs

# All commands have short aliases
mrkl c feat "dark mode"   # create
mrkl e 1                   # edit (numeric ID)
mrkl ls --type fix         # list
mrkl d 1                   # done (numeric ID)
mrkl x PROJ-002            # close
mrkl x 2 -r "duplicate"   # close with reason, numeric ID
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

### `mrkl init <prefix>`

Initializes mrkl in the current directory.

| Argument | Description                                              |
| -------- | -------------------------------------------------------- |
| `prefix` | Project prefix for task IDs (e.g., `PROJ`, `API`, `WEB`) |

Creates:

- `.config/mrkl/mrkl.toml` — project configuration
- `.config/mrkl/mrkl_counter` — auto-incrementing ID tracker
- `.tasks/` — active task directory
- `.tasks/.archive/` — completed task storage

Safe to run multiple times — existing config and counter are preserved.

### `mrkl create <type> <title> [options]`

Creates a new task file.

| Argument | Description                               |
| -------- | ----------------------------------------- |
| `type`   | Task type (see [Task Types](#task-types)) |
| `title`  | Short description of the task             |

| Option          | Alias | Description                       |
| --------------- | ----- | --------------------------------- |
| `--desc <text>` | `-d`  | Detailed description              |
| `--ac <text>`   | `-a`  | Acceptance criterion (repeatable) |

```sh
mrkl create feat "search functionality" \
  --desc "Full-text search across all documents" \
  --ac "search bar in header" \
  --ac "results update as you type" \
  --ac "highlights matching terms"
```

Running `mrkl create` with no arguments enters **interactive mode**, prompting for type, title, description, and acceptance criteria.

### `mrkl edit [id]`

Opens an existing task in an interactive TUI form for editing type, status, title, description, and acceptance criteria.

| Argument | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| `id`     | Task ID — full (`PROJ-001`), numeric (`1`), or zero-padded (`001`). Optional.   |

When called without an ID, opens the list TUI to select a task first.

```sh
# Edit a specific task
mrkl edit PROJ-001
mrkl e 1

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
| `id`     | Task ID(s) to mark done — full (`PROJ-001`), numeric (`1`), or zero-padded (`001`) |

Sets the task status to `done`, writes `flag: completed` in frontmatter, auto-checks all acceptance criteria (`- [x]`), and moves the file to `.tasks/.archive/`.

```sh
# Mark a single task as done
mrkl done PROJ-001

# Mark multiple tasks with numeric IDs
mrkl d 1 2 3
```

### `mrkl close <id...> [options]`

Closes one or more tasks that won't be done — duplicates, out-of-scope work, etc.

| Argument | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| `id`     | Task ID(s) to close — full (`PROJ-002`), numeric (`2`), or zero-padded (`002`) |

| Option            | Alias | Description                                        |
| ----------------- | ----- | -------------------------------------------------- |
| `--reason <text>` | `-r`  | Reason for closing (e.g., `duplicate`, `won't do`) |

Sets the task status to `closed`, writes the reason as a `flag` in frontmatter (if provided), and moves the file to `.tasks/.archive/`.

```sh
# Close a single task
mrkl close PROJ-002

# Close with just the number
mrkl x 2

# Close multiple tasks with a reason
mrkl x 3 4 5 -r "out of scope"
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

## Task File Format 📄

Each task is a markdown file with YAML frontmatter. By default, filenames use the short format:

```
.tasks/PROJ-001.md
```

```markdown
---
id: PROJ-001
title: user authentication
type: feat
status: todo
created: '2026-03-01'
---

## Description

Implement user authentication with OAuth2.

## Acceptance Criteria

- [ ] login page renders
- [ ] OAuth flow completes
- [ ] session persists across refreshes
```

With `verbose_files = true`, filenames include the type and title:

```
.tasks/PROJ-001 feat - user authentication.md
```

The `title` is always stored in frontmatter regardless of filename format. Use `mrkl edit <id>` to update type, status, title, description, or acceptance criteria via an interactive TUI, or edit task files directly.

## Project Structure 🗂️

After initialization, mrkl adds the following to your project:

```
your-project/
  .config/mrkl/
    mrkl.toml           # project configuration
    mrkl_counter        # current task number
  .tasks/
    PROJ-001.md
    PROJ-002.md
    .archive/
      PROJ-000.md
```

Commit `.config/mrkl/` and `.tasks/` to version control. They're designed to be tracked alongside your code.

## Team Workflow 👥

When using mrkl with **git worktrees** or **protected branches**, task IDs can conflict if multiple branches create tasks concurrently. The fix is a simple convention: **separate planning from execution.**

1. **Plan** — Create tasks on a `planning/` branch, merge to main via PR
2. **Execute** — Branch feature work from main (which has all tasks)
3. **Ad-hoc** — Mid-sprint tasks follow the same pattern at smaller scale

```sh
# Sprint planning
git checkout -b planning/sprint-3 main
mrkl create feat "user authentication"
mrkl create fix "login redirect loop"
# commit, PR, merge to main

# Feature work (branch from main after planning merges)
git checkout -b feature/MRKL-019_user-auth main
# ... do the work ...
mrkl done MRKL-019
# commit, PR, merge to main
```

The counter only increments on planning branches — one at a time — so IDs never conflict. See **[docs/workflow.md](docs/workflow.md)** for the full guide with examples and edge cases.

## Configuration ⚙️

Configuration lives in `.config/mrkl/mrkl.toml` (or `mrkl.toml` at the project root):

```toml
prefix = "PROJ"
tasks_dir = ".tasks"
verbose_files = false
```

| Key             | Default      | Description                                                         |
| --------------- | ------------ | ------------------------------------------------------------------- |
| `prefix`        | _(required)_ | Project prefix for task IDs                                         |
| `tasks_dir`     | `".tasks"`   | Directory for task files                                            |
| `verbose_files` | `false`      | Use verbose filenames (`PROJ-001 feat - title.md` vs `PROJ-001.md`) |

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
