---
name: groom-backlog
description: Analyze and groom the mrkl task backlog — close stale tasks, improve descriptions/ACs, and organize related tasks under epics. Use when the user mentions grooming, triaging, cleaning up, or reviewing their backlog, or says things like "groom tasks", "clean up backlog", "triage old tasks", "organize my tasks", or "what's stale in my backlog". Also trigger when the user asks to prune, uplift, or group tasks in bulk.
---

# Groom Backlog

Analyze the `.tasks/` folder for stale, incomplete, or disorganized tasks and help the user clean them up using the mrkl CLI. Work proceeds in three phases: **PRUNE**, **UPLIFT**, **GROUP**.

## How it works

You act as a backlog grooming partner. You analyze, recommend, and — once the user approves — execute changes via `pn dev` CLI commands. You never make changes without showing the user exactly what you intend to run first.

## Phase overview

| Phase | Purpose | CLI commands used |
|-------|---------|-------------------|
| **PRUNE** | Close tasks that are no longer relevant | `pn dev close <ID> -r "<reason>"` |
| **UPLIFT** | Improve individual task descriptions, ACs, flags, priorities | `pn dev edit <ID> --desc --ac --flag --priority` |
| **GROUP** | Organize related tasks under epics with parent/child/blocks relationships | `pn dev create`, `pn dev edit <ID> --parent --blocks` |

## Workflow

### Step 0: Load the backlog

Run this to get the full task list:

```bash
pn dev ls --plain
```

Read individual task files from `.tasks/` when you need full descriptions and acceptance criteria. Parse the YAML frontmatter for structured fields (id, type, status, priority, parent, blocks, flag, created date).

### Step 1: Analyze

Before proposing any changes, build a mental model of the backlog:

- **Age**: Tasks created more than 4 weeks ago with status `todo` are candidates for pruning or uplifting
- **Completeness**: Tasks missing descriptions, acceptance criteria, or with vague single-line descriptions need uplifting
- **Priority**: Consider impact vs effort — high-impact low-effort tasks should have priority 1-2; low-impact high-effort tasks should be 4-5
- **Relationships**: Look for tasks that are clearly related, sequential, or part of a larger initiative — these are grouping candidates
- **Staleness**: Tasks that reference completed work, removed features, or outdated goals should be pruned

Present a summary to the user:
- Total tasks by status
- Stale task candidates (with reasons)
- Tasks needing improvement
- Potential groupings

Ask: **"Which phase would you like to start with, or should we go through all three?"**

### Step 2: PRUNE

For each task you recommend closing:

1. State the task ID, title, and your reasoning
2. Show the exact command:
   ```
   pn dev close <ID> -r "<specific reason>"
   ```
3. Wait for user approval before executing

Batch recommendations in groups of 3-5 for efficiency. The user can approve all, reject all, or cherry-pick.

Good prune reasons are specific: "Superseded by MRKL-045", "Feature was descoped in v0.4", "Duplicate of MRKL-012". Avoid generic reasons like "old" or "stale".

### Step 3: UPLIFT

For each task you recommend improving:

1. State what's weak about the current task (vague description, missing ACs, wrong priority, no flag)
2. Show the exact edit command with the improved content:
   ```
   pn dev edit <ID> \
     --desc "Clear, actionable description" \
     --ac "First criterion|Second criterion|Third criterion" \
     --priority 2 \
     --flag "needs: API design finalized before starting"
   ```
3. Wait for user approval before executing

Prioritize uplifting by impact: tasks that are `in-progress` or high-priority `todo` first, then the rest.

When writing improved descriptions and ACs:
- Descriptions should state what needs to happen and why, in 1-3 sentences
- ACs should be concrete, testable checklist items (not vague goals)
- Use `--flag` for freeform notes, context, or reminders — not for blocking relationships (use `--blocks` for that)

### Step 4: GROUP

For related tasks that should be organized under an epic:

1. Explain the proposed grouping and why these tasks belong together
2. If no suitable epic exists, show the create command:
   ```
   pn dev create feat "<Epic title>" \
     --desc "What this initiative accomplishes"
   ```
3. Show the edit commands to set parent/child and blocking relationships:
   ```
   pn dev edit <CHILD-ID> --parent <EPIC-ID>
   pn dev edit <CHILD-ID> --blocks <OTHER-ID>
   ```
4. Wait for user approval before executing

When grouping:
- An epic is a task whose ID becomes the `parent` of other tasks
- Use `--blocks` to express sequencing (A blocks B means B can't start until A is done)
- Epics can have many children — mrkl tasks are granular by design. Up to ~10 children per epic is fine; more than 10 suggests the epic could be split

## Rules

- **Always show commands before running them.** Never execute a mrkl command without the user seeing it first.
- **Batch sensibly.** Present 3-5 recommendations at a time, not the entire backlog at once.
- **Respect user decisions.** If the user says "skip" or "no" for a task, move on. Don't argue.
- **Use the CLI, not file edits.** All changes go through `pn dev` commands — never edit `.tasks/` files directly.
- **One phase at a time.** Complete each phase before moving to the next. The user can skip phases.
- **Summarize at the end.** After all phases, give a brief recap: tasks closed, tasks improved, epics created/updated.
