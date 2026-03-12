---
id: MRKL-060
title: add github actions ci pipeline
type: ci
status: done
created: '2026-03-09'
flag: completed
---

## Description

Updated existing GitHub Actions CI workflow to include lint step and use package.json scripts consistently. Workflow runs on pushes and PRs to main: `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm exec unbuild`.

## Acceptance Criteria

- [x] ci workflow runs pnpm lint on PR
- [x] ci workflow runs pnpm typecheck on PR
- [x] ci workflow runs pnpm test on PR
- [x] ci blocks merge on failure (requires branch protection rule in repo settings)
- [x] ci caches pnpm store for speed (via actions/setup-node cache: pnpm)
