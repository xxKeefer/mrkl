---
id: MRKL-106
title: groom backlog skill
type: feat
status: done
created: '2026-03-10'
flag: completed
priority: 3
---

## Description

create a skill that analyses the task folder for outdated or extremely old taks and helps the user close them or bring them forward to relevancy

## Acceptance Criteria

- [x] the skill should use the mrkl cli to make all edits
- [x] the skill should seek to update the priority based on highest impact lowest effort tasks
- [x] the skill should show the comands it intends to run before commiting the the edits
- [x] the skill should be done in phases: PRUNE - close tasks that are no longer relevant with a specified reasons, UPLIFT: update singular tasks with better descritpions and/ or acs, GROUP: collect related tasks under a epic (newly created if neccessary or under an existing one) and update there sequencing and hierachal relationships. eg: parents, children, blocks, blocked by
- [x] the skill should be packaged and installable with `mrkl install-skill`
- [x] mrkl install-skills should overwrite previously installed skills to keep the skill uptodate
