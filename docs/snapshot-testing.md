# TUI Snapshot Testing

## How It Works

Snapshot tests capture the rendered terminal output of TUI components and compare it against a saved reference. This catches unintended visual regressions when changing render logic, ANSI codes, or layout calculations.

### The Pipeline

```
makeFormState() / makeListState()   <-- deterministic test state
        |
  render(state, mockStdout)         <-- writes raw ANSI to a buffer
        |
  renderToScreen(ansi, cols, rows)  <-- xterm-headless processes ANSI,
        |                               returns plain text grid
  toMatchSnapshot()                 <-- vitest compares against saved .snap file
```

1. **State factories** (`makeFormState`, `makeListState`) produce a known, deterministic form/list state with no randomness.
2. **`createMockStdout(cols, rows)`** fakes a `NodeJS.WriteStream` that captures everything written to it. The `columns`/`rows` properties control the terminal dimensions the render function sees.
3. **`render(state, stdout)`** or **`renderList(state, stdout)`** writes the full ANSI output (colors, cursor codes, box-drawing chars) into the mock stdout buffer.
4. **`renderToScreen(ansi, cols, rows)`** feeds that ANSI through `@xterm/headless` — a real terminal emulator running without a display. It returns a plain-text string of what the screen _looks like_ after all escape codes are processed. This is what gets snapshotted.

### Where Things Live

```
src/tui/
  create-tui.spec.ts          <-- snapshot tests live here
  list-tui.spec.ts             <-- (future snapshot tests)
  tui-test-harness.ts          <-- renderToScreen, createMockStdout, state factories
  __snapshots__/
    create-tui.spec.ts.snap    <-- saved snapshot data
```

## Visually Diffing Snapshots

### When a Snapshot Fails

If you change render code and a snapshot no longer matches, vitest shows a diff:

```
pnpm test -- src/tui/create-tui.spec.ts
```

The failure output shows the expected (saved) vs received (current) text side by side, with changed lines highlighted. This is your visual diff.

### Interactive UI Mode

For a richer diff experience, use vitest's UI:

```bash
pnpm vitest --ui -- src/tui/create-tui.spec.ts
```

This opens a browser-based interface where you can see snapshot diffs visually and approve/reject them individually.

### Manual Inspection

To see what a snapshot _looks like_ right now without running the full suite, you can read the snap file directly:

```bash
cat src/tui/__snapshots__/create-tui.spec.ts.snap
```

Each snapshot is a named export containing the plain-text terminal output. Since `renderToScreen` strips ANSI codes, the snap file shows exactly what a user would see on screen at that terminal width.

### Diffing Against Git

To see what changed in snapshots between commits:

```bash
git diff src/tui/__snapshots__/
```

## Updating Snapshots

### Accept All Changes

When you've intentionally changed render output and want to update all snapshots:

```bash
pnpm test -- --update src/tui/create-tui.spec.ts
```

Or update everything:

```bash
pnpm test -- --update
```

This overwrites all `.snap` files with the current output. **Review the git diff after updating** to confirm only expected changes were made.

### Accept Selectively (Per-File)

Vitest updates snapshots per-file. Run only the spec file whose snapshots you want to update:

```bash
# Only updates snapshots in create-tui.spec.ts
pnpm test -- --update src/tui/create-tui.spec.ts
```

Snapshots in other spec files remain untouched.

### Reject Changes

If a snapshot fails and the change is unintended — don't update. Fix the render code instead, then re-run the tests. The existing `.snap` file is the source of truth until you explicitly update it.

### Watch Mode Workflow

In watch mode, vitest prompts you interactively when snapshots fail:

```bash
pnpm vitest src/tui/create-tui.spec.ts
```

Press `u` to update failing snapshots, or fix your code and let it re-run automatically.

## Writing New Snapshot Tests

Follow the existing pattern:

```typescript
it('description of what is rendered', async () => {
  const stdout = createMockStdout(80, 24)    // width, height
  render(makeFormState(), stdout)             // render with known state
  const screen = await renderToScreen(stdout.getOutput(), 80, 24)
  expect(screen).toMatchSnapshot()
})
```

Key points:

- **Use fixed dimensions** — always pass explicit `cols` and `rows` to both `createMockStdout` and `renderToScreen`. Different sizes produce different layouts.
- **Use deterministic state** — the state factories produce the same output every run. No dates, no randomness, no file I/O.
- **One snapshot per visual scenario** — test at multiple widths (40, 80, 120) to catch layout issues at narrow and wide terminals.
- **Name tests clearly** — the test name becomes the snapshot key in the `.snap` file. If you rename a test, vitest treats it as a new snapshot and the old one becomes obsolete.

### Cleaning Up Obsolete Snapshots

If you rename or delete snapshot tests, stale entries remain in the `.snap` file. Clean them up:

```bash
pnpm test -- --update src/tui/create-tui.spec.ts
```

This regenerates the snap file with only the current test names.
