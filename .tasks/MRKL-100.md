---
id: MRKL-100
title: mrkl help command version
type: fix
status: todo
created: '2026-03-10'
priority: 5
---

## Description

The version shown in mrkl --help is hardcoded. It should read from package.json at runtime.

## Acceptance Criteria

- [ ] Help output displays version from package.json|Version updates automatically on release without code changes
