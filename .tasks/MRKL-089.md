---
id: MRKL-089
title: live file watching for list view
type: feat
status: todo
created: '2026-03-10'
parent: MRKL-083
---

## Description

Add fs.watch on the .tasks/ directory so the interactive list auto-refreshes when task files are created, modified, or deleted externally. Debounce filesystem events to avoid excessive re-renders. Update both the list rows and the preview pane on change. This is a nice-to-have enhancement.

## Acceptance Criteria

- [ ] list view detects file changes in .tasks/ directory
- [ ] list rows and preview update automatically on file change
- [ ] file watcher is cleaned up on list exit
- [ ] rapid successive file changes are debounced
- [ ] existing tests pass (pnpm test)
- [ ] typecheck passes (pnpm typecheck)
