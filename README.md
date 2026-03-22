<p align="center">
  <h1 align="center">mrkl</h1>
  <p align="center">
    <i>mrkl, rhymes with sparkle</i>
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

## Why mrkl?

- **No external service** — tasks live in `.tasks/` as structured markdown
- **Git-native** — commit, branch, and diff your tasks like any other file
- **AI-agent friendly** — consistent YAML frontmatter for programmatic parsing
- **Conventional commits vocabulary** — `feat`, `fix`, `chore`, etc.
- **Zero config** — one command to set up

## Install

```sh
pnpm add -g @xxkeefer/mrkl
```

## Quick Start

```sh
mrkl init                                    # set up .tasks/
mrkl create feat "user auth"                 # create a task
mrkl create fix "login loop" -P 5            # with priority (1-5)
mrkl list                                    # interactive TUI
mrkl list --plain                            # pipe-friendly output
mrkl done fub-09a3k1                         # mark done + archive
mrkl close fub-09a3k2 -r "duplicate"         # close with reason
```

Every command has a short alias: `i` init, `c` create, `ls` list, `e` edit, `d` done, `p` prune, `x` close.

Running a command without arguments opens an **interactive TUI**.

## Commands

| Command          | Alias | Description                                    |
| ---------------- | ----- | ---------------------------------------------- |
| `init`           | `i`   | Initialize `.tasks/` in the current project    |
| `create`         | `c`   | Create a new task                              |
| `edit`           | `e`   | Edit a task in an interactive TUI              |
| `list`           | `ls`  | List tasks (interactive TUI or `--plain`)      |
| `done`           | `d`   | Mark task(s) done and archive                  |
| `close`          | `x`   | Close task(s) with optional reason and archive |
| `prune`          | `p`   | Delete archived tasks before a cutoff date     |
| `install-skills` | —     | Install bundled Claude Code skills             |

### create

```sh
mrkl create <type> <title> [--desc <text>] [--ac <text>]... [--priority <1-5>]
```

Types: `feat` `fix` `chore` `docs` `perf` `refactor` `test` `ci` `build` `style`

### list

```sh
mrkl list [--type <type>] [--status <status>] [--search <text>] [--sortby <field:dir>] [--plain]
```

**TUI controls:**

| Key   | Action                         |
| ----- | ------------------------------ |
| `↑↓`  | Navigate tasks                 |
| `/`   | Search / filter                |
| `s`   | Cycle sort field               |
| `d`   | Toggle sort direction          |
| `p`   | Toggle preview panel           |
| `Tab` | Switch between Tasks / Archive |
| `Enter` | Open task in edit TUI        |
| `Esc` | Quit                           |

### edit

```sh
mrkl edit [id]          # by ID or prefix — omit to pick from list
```

### done / close

```sh
mrkl done <id...>
mrkl close <id...> [--reason <text>]
```

### prune

```sh
mrkl prune <YYYY-MM-DD> [--force]
```

## Icons

All output uses single-cell Unicode symbols — no emoji, consistent across terminals.

| Symbol | Meaning                     |
| ------ | --------------------------- |
| `○`    | todo                        |
| `◑`    | in-progress                 |
| `✔`    | done / success              |
| `✖`    | closed / error              |
| `⚠`    | warn                        |
| `ℹ`    | info                        |
| `▼▽◇△▲` | priority (lowest → highest) |
| `«` `»` | blocks / blocked-by         |
| `◉` `◌` | epic / child                |

## Task File Format

Tasks are markdown with YAML frontmatter, stored in `.tasks/`:

```markdown
---
id: fub-09a3k1
title: user authentication
type: feat
status: todo
priority: 3
created: '2026-03-20'
parent: fub-08z1a0
blocks:
  - fub-09b2c3
---

## Description

Implement user authentication with OAuth2.

## Acceptance Criteria

- [ ] login page renders
- [ ] OAuth flow completes
```

**Statuses:** `todo` `in-progress` `done` `closed`

**Relationships:** Tasks can have a `parent` (epic/child hierarchy) and `blocks` (dependency tracking). These are displayed in the list TUI with `◉`/`◌` and `«`/`»` indicators.

## Team Workflow

IDs are temporal base36 (`ddd-mmmmmm` — days since epoch + milliseconds since midnight). No counter, no config, no sync — create tasks on any branch and merge without conflicts.

## Development

```sh
git clone https://github.com/xxKeefer/mrkl.git
cd mrkl
pnpm install
pnpm test
pnpm dev list        # run CLI in development
pnpm build
```

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## License

[MIT](LICENSE)
