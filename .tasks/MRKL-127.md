---
id: MRKL-127
title: counter merge driver and gitattributes
type: feat
status: todo
created: '2026-03-17'
parent: MRKL-126
priority: 5
---

## Description

Ship mrkl sync-counter subcommand as a git merge driver that resolves mrkl_counter conflicts via max(ours, theirs), and add the .gitattributes entry.

## Acceptance Criteria

- [ ] mrkl sync-counter %O %A %B reads both versions and writes the max to the result file
- [ ] .gitattributes includes mrkl_counter merge=mrkl-counter entry
- [ ] Merging two branches with diverged counters produces zero manual conflict on mrkl_counter
