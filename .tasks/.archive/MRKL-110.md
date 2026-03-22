---
id: MRKL-110
title: responsive list layout
type: feat
status: done
created: '2026-03-12'
flag: completed
parent: MRKL-132
priority: 3
---

## Description

When the terminal is narrow, split the list view horizontally (list on top, preview on bottom) instead of vertically. List shows minimum 10 items; preview is truncated at terminal bottom.

## Acceptance Criteria

- [x] List view switches to horizontal split below a configurable column threshold|List panel shows at least 10 items in horizontal mode|Preview panel truncates at terminal bottom edge|Vertical split still used at wider widths
