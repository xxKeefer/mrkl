<p align="center">
  <h1 align="center">mrkl</h1>
  <p align="center">
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

## Why mrkl?

Most task trackers live outside your codebase. mrkl keeps tasks as markdown files right alongside your code — version-controlled, greppable, and readable by both humans and AI agents.

- **No external service** — tasks live in `.tasks/` as structured markdown
- **Git-native** — commit, branch, and diff your tasks like any other file
- **AI-agent friendly** — consistent YAML frontmatter makes tasks easy to parse programmatically
- **Conventional commits vocabulary** — task types mirror what you already use (`feat`, `fix`, `chore`, etc.)
- **Zero config** — one command to set up, sensible defaults for everything

## Install

```sh
npm install -g @xxkeefer/mrkl
```

Or use without installing:

```sh
npx @xxkeefer/mrkl init MY_PROJECT
```

## Quick Start

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

# Archive a completed task
mrkl done PROJ-001
```

## Commands

### `mrkl init <prefix>`

Initializes mrkl in the current directory.

| Argument | Description |
|----------|-------------|
| `prefix` | Project prefix for task IDs (e.g., `PROJ`, `API`, `WEB`) |

Creates:
- `.config/mrkl/mrkl.toml` — project configuration
- `.config/mrkl/mrkl_counter` — auto-incrementing ID tracker
- `.tasks/` — active task directory
- `.tasks/.archive/` — completed task storage

Safe to run multiple times — existing config and counter are preserved.

### `mrkl create <type> <title> [options]`

Creates a new task file.

| Argument | Description |
|----------|-------------|
| `type` | Task type (see [Task Types](#task-types)) |
| `title` | Short description of the task |

| Option | Description |
|--------|-------------|
| `--desc <text>` | Detailed description |
| `--ac <text>` | Acceptance criterion (repeatable) |

```sh
mrkl create feat "search functionality" \
  --desc "Full-text search across all documents" \
  --ac "search bar in header" \
  --ac "results update as you type" \
  --ac "highlights matching terms"
```

### `mrkl list [options]`

Lists all active tasks.

| Option | Description |
|--------|-------------|
| `--type <type>` | Filter by task type |
| `--status <status>` | Filter by status (`todo`, `in-progress`, `done`) |

Non-conforming markdown files in the tasks directory are silently skipped.

### `mrkl done <id>`

Archives a completed task.

| Argument | Description |
|----------|-------------|
| `id` | Task ID to archive (e.g., `PROJ-001`) |

Moves the task file to `.tasks/.archive/` and sets its status to `done`.

## Task Types

mrkl uses [conventional commit](https://www.conventionalcommits.org/) types:

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance |
| `docs` | Documentation |
| `perf` | Performance improvement |
| `refactor` | Code restructuring |
| `test` | Testing |
| `ci` | CI/CD changes |
| `build` | Build system changes |
| `style` | Code style/formatting |

## Task File Format

Each task is a markdown file with YAML frontmatter:

```
.tasks/PROJ-001 feat - user authentication.md
```

```markdown
---
id: PROJ-001
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

The format is intentionally simple — edit task files directly when you need to update descriptions, change status, or check off criteria.

## Project Structure

After initialization, mrkl adds the following to your project:

```
your-project/
  .config/mrkl/
    mrkl.toml           # project configuration
    mrkl_counter        # current task number
  .tasks/
    PROJ-001 feat - first task.md
    PROJ-002 fix - second task.md
    .archive/
      PROJ-000 chore - archived task.md
```

Commit `.config/mrkl/` and `.tasks/` to version control. They're designed to be tracked alongside your code.

## Team Workflow

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

## Configuration

Configuration lives in `.config/mrkl/mrkl.toml` (or `mrkl.toml` at the project root):

```toml
prefix = "PROJ"
tasks_dir = ".tasks"
```

| Key | Default | Description |
|-----|---------|-------------|
| `prefix` | *(required)* | Project prefix for task IDs |
| `tasks_dir` | `".tasks"` | Directory for task files |

## Development

```sh
git clone https://github.com/xxKeefer/mrkl.git
cd mrkl
npm install

# Run tests
npm test

# Run CLI in development
npx tsx src/cli.ts list

# Build
npm run build
```

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feat/my-feature`)
3. Commit your changes using [conventional commits](https://www.conventionalcommits.org/)
4. Push to your branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
