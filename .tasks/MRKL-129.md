---
id: MRKL-129
title: post-merge hook and mrkl init wiring
type: feat
status: todo
created: '2026-03-17'
parent: MRKL-126
priority: 4
blocks:
  - MRKL-127
  - MRKL-128
---

## Description

Extend mrkl init to register the merge driver in git config, write the post-merge hook, and set up .gitattributes - all idempotently.

## Acceptance Criteria

- [ ] mrkl init registers merge.mrkl-counter in git config
- [ ] mrkl init creates post-merge hook that runs mrkl sync --auto
- [ ] Existing hooks setup is detected - warns rather than overwriting core.hooksPath
- [ ] Running mrkl init twice does not duplicate entries
- [ ] Works on WSL/Linux
