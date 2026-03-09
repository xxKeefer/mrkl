---
id: MRKL-060
title: add github actions ci pipeline
type: ci
status: todo
created: '2026-03-09'
---

## Description

Set up GitHub Actions workflow for lint, typecheck, and test on PRs to main. Currently no CI config exists — all quality gates run locally only.

## Acceptance Criteria

- [ ] ci workflow runs pnpm lint on PR
- [ ] ci workflow runs pnpm typecheck on PR
- [ ] ci workflow runs pnpm test on PR
- [ ] ci blocks merge on failure
- [ ] ci caches pnpm store for speed
