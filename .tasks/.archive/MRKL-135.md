---
id: MRKL-135
title: toggle preview panel with persistence
type: feat
status: done
created: '2026-03-17'
flag: completed
parent: MRKL-132
priority: 3
---

## Description

Add p keybinding to toggle preview panel open/closed. When closed, list takes full terminal width. Persist preview_open state in mrkl.toml across sessions.

## Acceptance Criteria

- [x] Pressing p hides the preview panel and list takes full terminal width
- [x] Pressing p again restores the preview
- [x] Preview state persists across mrkl list invocations via mrkl.toml
- [x] Status bar shows p preview hint
