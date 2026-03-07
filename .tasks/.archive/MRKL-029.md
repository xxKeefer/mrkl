---
id: MRKL-029
title: verbose filenames
type: feat
status: closed
created: '2026-03-02'
---

## Description

i regret not making the title part of the frontmater and leaving it out of the filename

add a new boolean configuration to mrkl.toml, verbose_files. which default to false

if true, mrkl does current behaviour with the addition of adding the title to the frontmatter if
false, mrkl creates files with only the id and only includes the title as frontmatter property

## Acceptance Criteria

- [ ] new configuration `verbose_files` exists
- [ ] new configuration `verbose_files` defaults false
- [ ] changing the new configuration should be allowable at at any time between task creation
- [ ] test cover the new configuration ensuring mrkl doesn't break if the configuration changes
- [ ] list function is unaffected by new configuration
