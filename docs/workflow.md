# Team Workflow: Sprint-Planning Branch Convention

mrkl stores task files (`.tasks/*.md`) and a sequential counter (`.config/mrkl/mrkl_counter`) inside the git repo. When working with **git worktrees** or **protected branches** (merge via PR only), this can cause:

- **Counter divergence** — two branches creating the same task ID
- **Task file divergence** — tasks created in one branch invisible in others

The fix is a workflow convention, not a code change. Separate **planning** (task creation) from **execution** (feature work).

---

## Core Principle

> Create tasks on a dedicated planning branch. Merge to main via PR. Branch feature work from main _after_ tasks land.

The counter only ever increments on planning branches — one at a time — so IDs never conflict.

---

## Phase 1 — Sprint Planning

A single person (or pair) creates all tasks for the sprint on a planning branch.

```sh
# 1. Start from main
git checkout -b planning/sprint-3 main

# 2. Create tasks
mrkl create feat "user authentication"
mrkl create feat "dark mode"
mrkl create fix "login redirect loop" --desc "Users stuck after OAuth callback"
mrkl create chore "upgrade dependencies"

# 3. Commit
git add .tasks/ .config/mrkl/mrkl_counter
git commit -m "docs: plan sprint 3 tasks (MRKL-019 through MRKL-022)"

# 4. Push and open PR
git push -u origin planning/sprint-3
gh pr create --title "Sprint 3 planning" --body "Tasks for sprint 3"

# 5. Merge the PR — main now has all planned tasks
```

After the merge, `main` contains every task and an up-to-date counter.

---

## Phase 2 — Execution

Developers create feature branches (or worktrees) from `main` and work on their assigned tasks.

```sh
# 1. Start from main (with all planned tasks)
git checkout -b feature/MRKL-019_user-auth main
# — or with worktrees —
git worktree add ../mrkl-user-auth -b feature/MRKL-019_user-auth main

# 2. Do the work...

# 3. Mark task as done when complete
mrkl done MRKL-019

# 4. Commit everything (code + archived task)
git add .
git commit -m "feat: implement user authentication (MRKL-019)"

# 5. Push and open PR
git push -u origin feature/MRKL-019_user-auth
gh pr create --title "feat: user authentication" --body "Closes MRKL-019"
```

The archived task file merges to `main` with the feature PR.

---

## Phase 3 — Ad-hoc Tasks (Mid-Sprint)

Bugs or tasks discovered mid-sprint follow the same pattern, just smaller.

```sh
# 1. Create a small planning branch from main
git checkout -b planning/adhoc-20260302 main

# 2. Create the new task(s)
mrkl create fix "crash on empty search query"

# 3. Commit and PR
git add .tasks/ .config/mrkl/mrkl_counter
git commit -m "docs: ad-hoc task — crash on empty search (MRKL-023)"
git push -u origin planning/adhoc-20260302
gh pr create --title "Ad-hoc task: crash on empty search" --body "Mid-sprint bug discovery"

# 4. Merge the PR

# 5. Rebase your feature branch to pick it up, or start a new branch
git checkout feature/my-current-work
git rebase main
```

---

## Why This Works

| Concern            | How the convention handles it                                |
| ------------------ | ------------------------------------------------------------ |
| Counter conflicts  | Counter only increments on planning branches — one at a time |
| Task visibility    | Tasks merge to main via PR before feature branches start     |
| Protected branches | Everything goes through PRs — no direct pushes to main       |
| Worktree isolation | Each worktree branches from main _after_ tasks are merged    |
| Ad-hoc tasks       | Same pattern at smaller scale — planning branch, PR, merge   |
| No special tooling | Standard git + mrkl commands, no infrastructure needed       |

---

## Edge Cases

### Merge conflicts in task files

If two feature branches archive the same task (rare), or modify the same task file, git will flag a merge conflict. Since task files are small markdown with YAML frontmatter, conflicts are easy to resolve — keep the version with `status: done` and the most complete content.

### Viewing tasks before branching

Always pull main before creating a feature branch to make sure you have the latest tasks:

```sh
git checkout main
git pull
mrkl list
# Now branch from here
git checkout -b feature/MRKL-020_dark-mode
```

### Multiple planners

Avoid having two planning branches open at the same time — that reintroduces the counter conflict problem. If multiple people need to plan, coordinate so planning branches merge sequentially, or plan together on a single branch.

### AI agents following the convention

If an AI agent is creating tasks, instruct it to:

1. Check which branch it's on (`git branch --show-current`)
2. Only create tasks on branches prefixed with `planning/`
3. Never create tasks on feature branches

### Stale tasks on long-lived branches

If your feature branch lives long enough that new tasks are added to main, rebase onto main to pick them up:

```sh
git checkout feature/my-branch
git rebase main
mrkl list  # now shows newly planned tasks
```

---

## Quick Reference

| Action             | Command                                                   |
| ------------------ | --------------------------------------------------------- |
| Start planning     | `git checkout -b planning/sprint-N main`                  |
| Create task        | `mrkl create <type> "<title>"`                            |
| Commit planning    | `git add .tasks/ .config/mrkl/mrkl_counter && git commit` |
| Start feature work | `git checkout -b feature/MRKL-NNN_slug main`              |
| Complete task      | `mrkl done MRKL-NNN`                                      |
| Edit task          | `mrkl edit MRKL-NNN` or `mrkl e MRKL-NNN`                |
| Ad-hoc task        | `git checkout -b planning/adhoc-YYYYMMDD main`            |
| View tasks         | `mrkl list`                                               |
| Sync with main     | `git rebase main`                                         |
