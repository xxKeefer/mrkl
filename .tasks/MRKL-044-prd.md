## Problem Statement

mrkl currently treats every task as an isolated unit. There is no way to express that one task is part of a larger initiative (an epic), or that one task cannot proceed until another is completed (a blocking dependency). Users working on multi-task features have no way to see the big picture, track progress of a group of related tasks, or understand which tasks are stuck waiting on others. When a blocking task is completed, there is no automatic feedback to the tasks it was blocking.

## Solution

Introduce two relationship systems to mrkl:

1. **Epics (parent/child):** Any task can become an epic implicitly by having children. A child task stores a `parent` field pointing to its epic's ID. The list view groups children under their parent visually. When an epic is completed or closed and it still has open children, the user is prompted to choose: cancel, cascade (done/close all children too), or orphan (detach children and flag them).

2. **Blocking dependencies:** A task can declare that it `blocks` one or more other tasks. The inverse ("blocked by") is computed at read time by scanning active tasks — no two-way storage needed. When a blocking task is completed and archived, dependent tasks are naturally unblocked because the blocker no longer appears in active task scans. The list view shows dependency indicators on affected tasks.

Both relationship types use one-way storage in YAML frontmatter to keep things simple and eliminate sync risks.

## User Stories

1. As a developer, I want to create a task as a child of an existing task, so that I can break large features into smaller pieces.
2. As a developer, I want any task that has children to be implicitly treated as an epic, so that I don't need a separate "epic" task type.
3. As a developer, I want to specify a parent when creating a task via CLI flags (`--parent MRKL-040`), so that I can set relationships quickly.
4. As a developer, I want to specify a parent when creating a task via the interactive TUI using a fuzzy-find autocomplete field, so that I can discover and select the parent without memorizing IDs.
5. As a developer, I want to declare that my task blocks other tasks via CLI flags (`--blocks MRKL-045,MRKL-046`), so that dependencies are tracked.
6. As a developer, I want to add blocking relationships in the interactive TUI using a multi-select fuzzy-find field (similar to acceptance criteria entry), so that I can search for and select blocked tasks.
7. As a developer, I want the create and edit flows to validate that parent and blocked task IDs exist and are not archived, so that I don't create broken relationships.
8. As a developer, I want task ID arguments for `--parent` and `--blocks` to accept full IDs (`MRKL-040`), zero-padded numeric IDs (`040`), and plain numeric IDs (`40`), consistent with all other mrkl commands.
9. As a developer, I want the plain-text list view to group child tasks under their epic with tree-style indentation, so that I can see the hierarchy at a glance.
10. As a developer, I want the plain-text list view to show a blocked indicator (e.g., "blocked by MRKL-039") on tasks that have active blockers, so that I can see what's stuck.
11. As a developer, I want the plain-text list view to show a blocks indicator (e.g., "blocks MRKL-041") on tasks that are blocking others, so that I can see downstream impact.
12. As a developer, I want the interactive TUI list to show the same grouped hierarchy and dependency indicators, so that the TUI and plain views are consistent.
13. As a developer, I want the TUI preview pane to show a "Relationships" section listing parent, children, blocks, and blocked-by, so that I can see all relationships for the selected task.
14. As a developer, I want to mark an epic as done, and if it has open children, be prompted with three options: (a) cancel, (b) mark all children as done too, or (c) orphan the children, so that I have control over what happens to child tasks.
15. As a developer, I want to close an epic, and if it has open children, be prompted with the same three options but with "close" semantics (cascade closes children rather than marking done), so that close and done behave consistently for epics.
16. As a developer, I want orphaned children to have their `parent` field removed and their `flag` field appended with `<orphan of MRKL-040>` in angle brackets, so that the orphan history is preserved without losing existing flags.
17. As a developer, I want the edit flow to support modifying `parent` and `blocks` fields on an existing task, so that I can restructure relationships after creation.
18. As a developer, I want only active (non-archived) blockers to appear as dependency indicators in the list view, so that completed blockers don't clutter the display.
19. As a developer, I want a task to have at most one parent (no nested epics), so that the hierarchy stays flat and simple.
20. As a developer, I want `parent` and `blocks` fields to be omitted from frontmatter entirely when not set, so that task files stay clean and uncluttered.

## Implementation Decisions

### Frontmatter Schema Changes

Two new optional fields on task frontmatter:

- `parent`: optional string — a single task ID (e.g., `MRKL-040`). Indicates this task is a child of the referenced epic.
- `blocks`: optional string array — a list of task IDs. Indicates this task blocks the listed tasks.

Both fields are omitted entirely when not set (no empty arrays or nulls).

### One-Way Storage Model

Relationships are stored in one direction only:

- **Parent/child:** The child stores `parent: MRKL-040`. The parent stores nothing. Children are discovered by scanning active tasks for matching `parent` values.
- **Blocking:** The blocker stores `blocks: [MRKL-045]`. The blocked task stores nothing. "Blocked by" is computed by scanning active tasks for any that list the target in their `blocks` array.

This eliminates all sync risks. Completing/archiving a blocker naturally unblocks dependents because the archived task is no longer scanned.

### Relationship Computation

A set of pure functions scan the active task list to compute inverse relationships:

- `getChildren(tasks, epicId)` — returns tasks where `parent === epicId`
- `getBlockedBy(tasks, taskId)` — returns tasks that have `taskId` in their `blocks` array

These operate on already-loaded `TaskData[]` arrays, keeping the scan cost negligible.

### Epic Cascade Behavior

When `done` or `close` is called on a task that has active children:

1. Display a prompt listing the open children.
2. Offer three choices:
   - **Cancel** — abort the operation.
   - **Cascade** — `done` marks all children as done; `close` marks all children as closed. All children are archived.
   - **Orphan** — remove the `parent` field from each child and append `<orphan of {epicId}>` to their existing `flag` field (or set it if empty). Children remain active.
3. After handling children, proceed with the epic's own done/close.

### Validation

On create and edit:

- If `parent` is specified, the referenced task must exist in active (non-archived) tasks.
- If `blocks` contains IDs, each must exist in active (non-archived) tasks.
- No circular dependency validation in v1.
- No nested epics — a task with a `parent` cannot itself be a `parent` of other tasks (enforced at create/edit time).

### List View Display

**Plain mode** — grouped with tree indicators:

```
MRKL-040  feat  todo    Design system
  MRKL-041  feat  todo  +-- Build parser         blocked by MRKL-039
  MRKL-042  feat  todo  +-- Build renderer
MRKL-039  fix   todo    Fix tokenizer           blocks MRKL-041
MRKL-043  chore todo    Update deps
```

**TUI mode** — same grouping in the left pane. Preview pane adds a "Relationships" section showing parent, children, blocks, and blocked-by.

### Create Command

New CLI flags:

- `--parent <id>` / `-P <id>` — set parent task
- `--blocks <id,id,...>` / `-b <id,id,...>` — set blocked tasks (comma-separated)

Interactive TUI adds two new fields:

- **Parent** — fuzzy-find autocomplete text field filtering active non-archived tasks
- **Blocks** — multi-entry fuzzy-find field (similar to acceptance criteria) filtering active non-archived tasks

### Edit Command

The interactive edit form gains the same two fields (parent, blocks), pre-populated with current values.

## Testing Decisions

Tests should verify external behavior through the public interfaces, not internal implementation details.

### Modules to test

**`src/task.ts`** — highest value target:
- Creating tasks with `parent` and `blocks` fields
- Validation: parent must exist, blocks must exist, no archived references
- `getChildren` and `getBlockedBy` computation from task lists
- Epic cascade: done with open children triggers correct file state for cascade and orphan paths
- Orphan flag appending (empty flag, existing flag)
- Completing a blocker naturally unblocks dependents (no file written to blocked task)

**`src/template.ts`** — round-trip fidelity:
- `render()` then `parse()` preserves `parent` and `blocks` fields
- Omits `parent` and `blocks` when not set
- Handles `blocks` as both single-item and multi-item arrays

### Prior art

Existing tests in `tests/task.test.ts` and `tests/list-archived.test.ts` use a pattern of creating temporary directories with `writeArchivedTask` / `writeFileSync` helpers, then calling the public functions and asserting on returned data or file system state. New tests should follow this same pattern.

## Out of Scope

- Circular dependency detection (v1 accepts user input at face value)
- Nested epics (a child task cannot also be an epic)
- Two-way relationship storage / sync
- A `mrkl doctor` command to detect relationship drift
- A dedicated `flag` command (planned separately)
- "Related" or generic link relationships (covered by the existing `flag` field)
- Blocking validation at runtime (e.g., preventing status change to `in-progress` if blocked)
- Epic progress indicators (e.g., "3/5 children done") — nice-to-have for a future iteration
- Scanning archived tasks for historical "was blocked by" information

## Further Notes

- The one-way storage model is the key architectural decision. It trades slightly more computation at read time (scanning tasks) for zero sync complexity at write time. This is the right tradeoff for mrkl's typical scale (tens to low hundreds of tasks).
- The `flag` field append convention uses angle brackets (`<orphan of MRKL-040>`) to distinguish system-generated flags from user-written ones. This is a lightweight convention, not enforced programmatically.
- The "no nested epics" constraint keeps the hierarchy flat (max depth of 1). This dramatically simplifies the list view grouping, cascade logic, and mental model. If users need deeper nesting, it should be a separate design exercise.
