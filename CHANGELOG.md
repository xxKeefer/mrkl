# Changelog

## v0.2.10...main

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.10...main)

### Fixed

- Publish step ([749e373](https://github.com/xxKeefer/mrkl/commit/749e373))

### ❤️ Contributors

- XxKeefer <xxkeefer@pm.me>

## v0.2.9...main

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.9...main)

### Fixed

- Auth issues in release job ([54305aa](https://github.com/xxKeefer/mrkl/commit/54305aa))

### ❤️ Contributors

- XxKeefer <xxkeefer@pm.me>

## v0.2.8...main

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.8...main)

### Fixed

- Consolidate release & publish workflow and backfill changelog (MRKL-019) ([#9](https://github.com/xxKeefer/mrkl/pull/9))

### Changed

- Plan some work items ([#8](https://github.com/xxKeefer/mrkl/pull/8))

### ❤️ Contributors

- Daniel John Keefer <xxkeefer.code@gmail.com>

## v0.2.8

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.6...v0.2.8)

### Changed

- Migrate to github action for releases ([#5](https://github.com/xxKeefer/mrkl/pull/5))
- Fix release action struggle ([#7](https://github.com/xxKeefer/mrkl/pull/7))

### Fixed

- Pnpm version in release action ([#6](https://github.com/xxKeefer/mrkl/pull/6))

## v0.2.6

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.5...v0.2.6)

### Fixed

- Fix publish workflow ([204aba2](https://github.com/xxKeefer/mrkl/commit/204aba2))

## v0.2.5

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.4...v0.2.5)

### Added

- Add `c` alias for `create` command ([718ba38](https://github.com/xxKeefer/mrkl/commit/718ba38))

### Changed

- Sanitise task titles to prevent invalid filenames ([c0325f6](https://github.com/xxKeefer/mrkl/commit/c0325f6))
- Document best practice for teams and worktrees ([b7a36ac](https://github.com/xxKeefer/mrkl/commit/b7a36ac))
- Automate changelog ([#4](https://github.com/xxKeefer/mrkl/pull/4))

### Fixed

- Normalize multiple --ac flags into separate acceptance criteria ([4b07d88](https://github.com/xxKeefer/mrkl/commit/4b07d88))

## v0.2.4

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.3...v0.2.4)

### Fixed

- Use node 24 for npm OIDC trusted publishing ([63210b0](https://github.com/xxKeefer/mrkl/commit/63210b0))

## v0.2.3

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.2...v0.2.3)

### Fixed

- Remove registry-url to allow OIDC auth ([e88a0ec](https://github.com/xxKeefer/mrkl/commit/e88a0ec))

## v0.2.2

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.2.0...v0.2.2)

### Changed

- Update release workflow ([1acd396](https://github.com/xxKeefer/mrkl/commit/1acd396))

## v0.2.0

[compare changes](https://github.com/xxKeefer/mrkl/compare/v0.1.0...v0.2.0)

### Added

- Implement config module with .config/mrkl lookup ([3041663](https://github.com/xxKeefer/mrkl/commit/3041663))
- Implement counter module for auto-incrementing task IDs ([63f3ba0](https://github.com/xxKeefer/mrkl/commit/63f3ba0))
- Implement template module for rendering and parsing task markdown ([9f1e5fb](https://github.com/xxKeefer/mrkl/commit/9f1e5fb))
- Implement task module for CRUD operations on task files ([3bd9d10](https://github.com/xxKeefer/mrkl/commit/3bd9d10))
- Add type validation and error handling to CLI commands ([9c7e037](https://github.com/xxKeefer/mrkl/commit/9c7e037))

### Fixed

- Move mrkl_counter into .config/mrkl and add resilient listTasks parsing ([5611495](https://github.com/xxKeefer/mrkl/commit/5611495))

## v0.1.0

Initial release.
