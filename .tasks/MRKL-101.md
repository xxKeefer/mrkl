---
id: MRKL-101
title: warn of update
type: feat
status: todo
created: '2026-03-10'
priority: 2
---

## Description

Notify users when a newer version of mrkl is published to npm. Show the update command.

## Acceptance Criteria

- [ ] CLI checks npm registry for latest version on run|Warning displayed when local version is behind|Shows the exact command to update (e.g. pnpm update -g @xxkeefer/mrkl)|Check is non-blocking and does not slow down commands
