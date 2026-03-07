---
id: MRKL-021
title: shorthand aliases for existing comands and flags
type: feat
status: done
created: '2026-03-02'
---
## Description

Add shorthand aliases for all existing commands and flags so users can type less.

**Command aliases:**
- `i` → `init`
- `c` → `create` (already exists)
- `ls` → `list`
- `d` → `done`

**Flag aliases:**
- `create --desc` → `-d`
- `create --ac` → `-a`
- `list --type` → `-t`
- `list --status` → `-s`

## Acceptance Criteria

- [ ] `mrkl i <prefix>` works the same as `mrkl init <prefix>`
- [ ] `mrkl ls` works the same as `mrkl list`
- [ ] `mrkl d <id>` works the same as `mrkl done <id>`
- [ ] `mrkl c` alias for `create` continues to work
- [ ] `mrkl create feat "title" -d "desc"` works the same as `--desc`
- [ ] `mrkl create feat "title" -a "criterion"` works the same as `--ac`
- [ ] `mrkl list -t feat` works the same as `--type feat`
- [ ] `mrkl list -s todo` works the same as `--status todo`
- [ ] All aliases are tested
