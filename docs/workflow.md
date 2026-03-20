# Team Workflow

mrkl uses temporal base36 IDs (`ddd-mmmmmm` — days since epoch + milliseconds since midnight UTC). IDs are generated from timestamps, making collisions near-impossible even when multiple developers create tasks concurrently on different branches.

No counter file, no config file, no sync command, no git hooks — just create tasks anywhere and merge.

---

## Creating Tasks

Create tasks on any branch. There's no need for dedicated planning branches.

```sh
mrkl create feat "user authentication"
mrkl create fix "login redirect loop" --desc "Users stuck after OAuth callback" -P 4
```

## Completing Tasks

```sh
# Mark done and archive
mrkl done fub-09a3k1

# Close without completing
mrkl close fub-09a3k2 -r "duplicate"
```

## Merge Conflicts

Since each task is its own file with a unique temporal ID, merge conflicts between task files are rare. If two branches archive the same task, keep the version with `status: done` and the most complete content.

## Legacy IDs

Existing tasks with `PREFIX-NNN` style IDs (e.g., `MRKL-019`) continue to work. They load, display, and resolve via prefix matching just like temporal IDs.

---

## Quick Reference

| Action        | Command                            |
| ------------- | ---------------------------------- |
| Create task   | `mrkl create <type> "<title>"`     |
| Complete task | `mrkl done <id>`                   |
| Close task    | `mrkl close <id> [-r "<reason>"]`  |
| Edit task     | `mrkl edit <id>`                   |
| View tasks    | `mrkl list`                        |
