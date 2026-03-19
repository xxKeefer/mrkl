# Ubiquitous Language

## Core entities

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Task** | The primary domain entity: a markdown file with YAML frontmatter representing a unit of work, stored in the tasks directory | Ticket, Issue, Item, Card |
| **TaskFile** | The on-disk `.md` file backing a Task, named either verbosely (`{id} {type} - {title}.md`) or tersely (`{id}.md`) depending on config | Document, Note |
| **TaskData** | The in-memory representation of a Task after parsing frontmatter and body sections | Record, Object, Entry |

## Task identity and metadata

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Task ID** | A unique identifier in the format `{PREFIX}-{NNN}` (e.g., `MRKL-001`), assigned sequentially via the counter | Number, Key, Ref |
| **TaskType** | The category of work: `feat`, `fix`, `chore`, `docs`, `perf`, `refactor`, `test`, `ci`, `build`, `style` — mirrors conventional commit types | Category, Kind, Label |
| **Status** | The lifecycle state of a Task: `todo`, `in-progress`, `done`, `closed` | State, Phase, Stage |
| **Priority** | A numeric rank from 1 (lowest) to 5 (highest), defaulting to 3 | Severity, Urgency, Weight |
| **Flag** | A freeform string annotation on a Task, used for close reasons or orphan markers | Tag, Label, Note |

## Task structure

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Description** | The body section of a TaskFile under `## Description`, containing freeform context | Summary, Details, Body |
| **Acceptance Criteria** | A checklist under `## Acceptance Criteria` defining what "done" means; rendered as `- [ ]` items, checked (`- [x]`) when the Task is marked done | Requirements, Checklist, Definition of Done |
| **Frontmatter** | The YAML header of a TaskFile containing structured metadata (id, title, type, status, priority, flag, parent, blocks) | Header, Metadata, YAML block |

## Relationships

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Epic** | A Task that has children — not a separate entity, just a Task referenced as a `parent` by other Tasks; only one level of nesting allowed | Story, Feature, Parent Task |
| **Child** | A Task whose `parent` field references an Epic's Task ID | Subtask, Sub-issue |
| **Blocks** | A directional dependency: Task A `blocks` Task B means B cannot proceed until A is resolved; stored as an array of Task IDs on the blocking Task | Depends on, Dependency |
| **Blocked By** | The inverse view of Blocks: derived at read time by scanning which Tasks list a given Task ID in their `blocks` array — not stored on disk | Waiting on, Upstream |
| **Orphan** | A Child whose Epic has been closed; the `parent` field is removed and a flag `<orphan of {ID}>` is added | Detached, Unparented |

## Lifecycle operations

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Create** | Allocate a new Task ID via the counter, write a TaskFile to the tasks directory with status `todo` | Add, New, Open |
| **Edit** | Full replacement of a Task's mutable fields via the TUI editor; preserves `id` and `created` | Modify, Change |
| **Patch** | Partial update of specific fields on a Task without touching others | Update (ambiguous with Edit) |
| **Done** | Close a Task with status `done`, check all acceptance criteria, and move the TaskFile to the archive | Complete, Finish, Resolve |
| **Close** | Close a Task with status `closed` (optionally with a reason flag), and move the TaskFile to the archive; distinct from Done — implies cancelled or abandoned | Cancel, Reject, Delete |
| **Archive** | Move a TaskFile from the active tasks directory to `.archive/`; the on-disk consequence of Done or Close — not a user-facing action | Soft-delete, Hide |
| **Cascade Close** | When closing an Epic, all its Children are also closed with the same status | Bulk close, Recursive close |
| **Orphan Children** | When closing an Epic, remove the `parent` reference from Children and flag them instead of cascade-closing | Detach, Unparent |
| **Prune** | Permanently delete archived TaskFiles older than a cutoff date | Purge, Clean, GC |

## Configuration

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Config** | The `mrkl.toml` file (at `.config/mrkl/mrkl.toml` or root) containing `prefix`, `tasks_dir`, and `verbose_files` | Settings, Preferences, Options |
| **Prefix** | The string prepended to task numbers to form Task IDs (e.g., `MRKL`) | Namespace, Project key |
| **Tasks Directory** | The directory where active TaskFiles are stored, default `.tasks/` | Task folder, Work dir |
| **Verbose Files** | A boolean config flag; when true, TaskFiles are named `{id} {type} - {title}.md` instead of `{id}.md` | Long names, Descriptive filenames |
| **Counter** | A file at `.config/mrkl/mrkl_counter` holding the next sequential integer for Task ID generation | Sequence, Auto-increment |

## Storage topology

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Active Task** | A TaskFile in the tasks directory (not archived) | Open task, Live task |
| **Archived Task** | A TaskFile in `.tasks/.archive/`, resulting from Done or Close | Completed task, Closed task |
| **Init** | Bootstrap a project: create config, tasks directory, archive subdirectory, and counter file | Setup, Bootstrap |

## Template operations

| Term | Definition | Aliases to avoid |
| ---- | ---------- | ---------------- |
| **Render** | Serialize a TaskData into a TaskFile string (frontmatter + markdown body) via gray-matter | Serialize, Stringify, Write |
| **Parse** | Deserialize a TaskFile string into TaskData, extracting frontmatter and body sections | Deserialize, Read, Load |

## Relationships summary

- A **Task** is backed by exactly one **TaskFile** on disk
- A **Task** has exactly one **Status**, one **TaskType**, and one **Priority**
- A **Task** may optionally have a **Flag**, a **Parent** (making it a **Child**), and a **Blocks** list
- An **Epic** is any Task that is referenced as a **Parent** — it is not a distinct entity
- **Blocked By** is computed at read time, never stored
- **Done** and **Close** both result in **Archive**; they differ in status and intent
- **Cascade Close** and **Orphan Children** are mutually exclusive strategies when closing an **Epic**
- **Prune** operates only on **Archived Tasks**, never active ones
- **Config** governs **Prefix**, **Tasks Directory**, **Verbose Files**, and **Counter** location

## Example dialogue

> **Dev:** "How do I track a new piece of work?"

> **Domain expert:** "**Create** a **Task**. Give it a **TaskType** like `feat` or `fix`, a title, and optionally a description and **Acceptance Criteria**. It gets a **Task ID** like `MRKL-042` and starts in `todo` **Status**."

> **Dev:** "What if this task depends on another being finished first?"

> **Domain expert:** "Set the **Blocks** field on the blocking **Task**. The blocked task will show a **Blocked By** indicator when listed — but that's computed, not stored."

> **Dev:** "Can I group related tasks under a parent?"

> **Domain expert:** "Yes — set the `parent` field on the **Children** to point at the **Epic's** **Task ID**. Only one level of nesting is allowed. The **Epic** doesn't need any special type — any **Task** becomes an **Epic** when something references it as a parent."

> **Dev:** "What happens when I finish the epic?"

> **Domain expert:** "You choose: **Cascade Close** to close all **Children** with the same status, or **Orphan Children** to detach them so they continue independently. Orphaned tasks get a **Flag** noting which **Epic** they came from."

> **Dev:** "And when I'm done with a task?"

> **Domain expert:** "Mark it **Done** — that checks all **Acceptance Criteria**, sets status to `done`, and **Archives** the **TaskFile** to `.archive/`. If the task was cancelled instead, **Close** it — same archive behavior, but status is `closed` and you can add a reason **Flag**."

> **Dev:** "How do I clean up old archived tasks?"

> **Domain expert:** "**Prune** with a cutoff date. It permanently deletes **Archived Tasks** created before that date. Only touches `.archive/`, never active tasks."

## Flagged ambiguities

- **"Close" vs "Done"** — Both archive the task. **Done** implies successful completion (status `done`, criteria checked). **Close** implies cancellation or abandonment (status `closed`, optional reason flag). The CLI uses `d`/`done` and `x`/`close` respectively.
- **"Epic" is not a type** — An Epic is any Task that happens to be referenced as a `parent`. There is no `epic` TaskType. The distinction is purely relational.
- **"Orphan" dual meaning** — An orphan is both (1) a Child whose Epic was closed with the orphan strategy, and (2) a Child whose parent Task ID doesn't exist in the active task list. The flag marker distinguishes case (1).
- **"Archive" as action vs location** — "Archive" refers both to the act of moving a TaskFile (a consequence of Done/Close) and the `.archive/` directory itself. Context disambiguates.
- **"Patch" vs "Edit"** — Edit replaces all mutable fields (TUI workflow). Patch updates only specified fields (programmatic workflow). Both write the same TaskFile format.
