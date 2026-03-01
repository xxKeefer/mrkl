## Problem Statement

Developers working on small projects or side projects need a way to track tasks without paying for tools like Jira or GitHub Issues. Existing solutions are either too heavy (Jira), require paid tiers for private repos (GitHub Issues), or aren't structured enough for AI agents to parse and manage. Current workarounds — like freeform markdown files in a `.tasks/` folder — lack consistency, numbering, status tracking, and any CLI tooling to manage them.

## Solution

`mrkl` — a lightweight CLI tool that generates structured markdown task files in a `.tasks/` directory. It provides Jira-like ticket numbering (e.g., `VON-001`), enforced conventional commit type prefixes, YAML frontmatter for metadata, and a simple set of commands to create, list, and archive tasks. The markdown format is both human-readable and AI-friendly, making it easy for AI coding agents to read, create, and manage tasks alongside the developer.

## User Stories

1. As a developer, I want to run `mrkl init` in my project root, so that a `.tasks/` directory, `mrkl.toml` config, and `mrkl_counter` file are created for me.
2. As a developer, I want to set a per-project ticket prefix in `mrkl.toml` (e.g., `VON`), so that all task IDs are scoped to my project.
3. As a developer, I want ticket numbers to auto-increment from a `mrkl_counter` file, so that I never get duplicate IDs.
4. As a developer, I want to run `mrkl create` interactively, so that I'm prompted for type, title, description, and acceptance criteria step by step.
5. As a developer, I want to run `mrkl create` with flags (e.g., `mrkl create feat "add login" --desc "..." --ac "criterion one" --ac "criterion two"`), so that I can script task creation or create tasks quickly.
6. As a developer, I want the task type to be enforced from a conventional commit set (`feat`, `fix`, `chore`, `docs`, `perf`, `refactor`, `test`, `ci`, `build`, `style`), so that task types are consistent and meaningful.
7. As a developer, I want created task files to have a structured filename like `VON-001 feat - add login.md`, so that tasks are easy to identify at a glance in a file explorer.
8. As a developer, I want created task files to contain YAML frontmatter with `id`, `type`, `status`, and `created` fields, so that metadata is machine-parseable.
9. As a developer, I want the default status of a new task to be `todo`, so that I can see what work hasn't started.
10. As a developer, I want the task file body to have `## Description` and `## Acceptance Criteria` sections, so that requirements are clearly structured.
11. As a developer, I want acceptance criteria rendered as a markdown checklist (`- [ ] item`), so that progress can be tracked by checking items off.
12. As a developer, I want to run `mrkl list` to see all active tasks with their ID, type, status, and title, so that I get a quick overview of work.
13. As a developer, I want to filter `mrkl list` by type (e.g., `mrkl list --type feat`) or status (e.g., `mrkl list --status in-progress`), so that I can focus on relevant tasks.
14. As a developer, I want to run `mrkl done <id>` to archive a completed task, so that my active task list stays clean.
15. As a developer, I want archived tasks moved to `.tasks/.archive/`, so that history is preserved but not cluttering the active directory.
16. As a developer, I want the `.tasks/` directory to be committable to git, so that task history lives with the code.
17. As an AI coding agent, I want task files to have consistent YAML frontmatter and markdown structure, so that I can reliably parse and generate tasks.
18. As a developer, I want to install `mrkl` globally via `npm i -g mrkl`, so that I can use it across all my projects.
19. As a developer, I want `mrkl init` to be idempotent — running it again shouldn't overwrite my existing config or reset my counter.
20. As a developer, I want clear error messages when I try to create a task without running `init` first, or use an invalid task type.

## Implementation Decisions

### Package & Distribution
- Standalone npm package named `mrkl`, published to npm
- CLI binary name: `mrkl`
- Node + TypeScript
- CLI framework: `citty`

### Configuration
- Per-project config file: `mrkl.toml` in project root
- Contains: `prefix` (string, e.g., `"VON"`), `tasks_dir` (string, default `".tasks"`)
- Counter stored in a plain text file `mrkl_counter` co-located with `mrkl.toml`
- Counter file contains a single integer — the last used ticket number

### File Naming Convention
- Format: `{PREFIX}-{NUMBER} {type} - {title}.md`
- Example: `VON-001 feat - add login.md`
- Number zero-padded to 3 digits (or more as needed)

### Task File Structure
```yaml
---
id: VON-001
type: feat
status: todo
created: 2026-03-01
---
```
```markdown
## Description

User-provided description here.

## Acceptance Criteria

- [ ] First criterion
- [ ] Second criterion
```

### Statuses
- `todo` — not started (default on create)
- `in-progress` — actively being worked on
- `done` — completed (triggers archive on `mrkl done`)

### Enforced Task Types
Based on conventional commits: `feat`, `fix`, `chore`, `docs`, `perf`, `refactor`, `test`, `ci`, `build`, `style`

### Archive Behavior
- `mrkl done <id>` sets status to `done` in frontmatter and moves the file to `.tasks/.archive/`
- Archive directory is auto-created if it doesn't exist

### Module Architecture (Deep Modules)

1. **config** — Reads/writes/validates `mrkl.toml`. Walks up directories to find project root. Handles defaults.
   - Interface: `loadConfig(dir): Config`, `initConfig(dir, opts): void`

2. **counter** — Reads/writes `mrkl_counter`. Atomic read-and-increment.
   - Interface: `nextId(dir): number`, `currentId(dir): number`

3. **template** — Renders task data to structured markdown string. Parses markdown back to task data.
   - Interface: `render(task): string`, `parse(content): TaskData`

4. **task** — Orchestrates config + counter + template + filesystem. All CRUD operations on task files.
   - Interface: `createTask(opts): Task`, `listTasks(filter): Task[]`, `archiveTask(id): void`

5. **cli** — Thin citty command definitions wiring user input to the task module. Commands: `init`, `create`, `list`, `done`.

## Testing Decisions

### What Makes a Good Test
- Tests should verify **external behavior through the module's public interface**, not implementation details
- Tests should be independent and not rely on shared mutable state
- Use a temporary directory for filesystem operations so tests don't pollute each other
- Test the contract: given inputs → expected outputs/side effects

### Modules Under Test
- **config** — test loading, writing, validation, defaults, idempotent init, error cases (missing config)
- **counter** — test increment, read, initialization from zero, persistence across calls
- **template** — test render produces correct frontmatter + markdown structure, parse round-trips correctly
- **task** — test create (file created with correct name, content, counter incremented), list (filtering by type/status), archive (file moved, status updated)

### Not Tested Directly
- **cli** — thin wiring layer, tested indirectly through integration/manual testing

## Out of Scope

- Web UI or dashboard
- Multi-user / collaboration features
- Syncing with external tools (Jira, GitHub Issues, Linear)
- Task dependencies or linking between tasks
- Priority field or ordering
- Due dates or time tracking
- `status` command to update status without archiving (can edit file directly for v1)
- `view` command to pretty-print a task (can `cat` the file for v1)
- Subtasks or parent/child relationships

## Further Notes

- The entire `.tasks/` directory (including `.archive/`) should be git-committed so task history travels with the codebase
- The `mrkl_counter` file should also be committed — it's the source of truth for the next ID
- AI agents (like Claude Code) can read `.tasks/` to understand project context and can use `mrkl create` to generate tasks — the structured format makes this reliable
- Future versions could add `mrkl status <id> <status>` for status transitions without archiving, `mrkl view <id>` for pretty-printing, and template customization via config
