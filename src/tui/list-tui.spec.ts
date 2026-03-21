import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildEntries, renderList } from './list-tui.js'
import type { ListRenderState } from './list-tui.js'
import { makeTask, makeListState, createMockStdout, renderToScreen, spawnTui, type TuiProcess } from './tui-test-harness.js'

describe('buildEntries', () => {
  it('produces ListEntry[] from flat tasks', () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'First', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-002', title: 'Second', type: 'fix', status: 'in-progress' }),
    ]
    const entries = buildEntries(tasks)
    expect(entries).toHaveLength(2)
    expect(entries[0].task.id).toBe('MRKL-001')
    expect(entries[0].searchText).toContain('MRKL-001')
    expect(entries[0].searchText).toContain('First')
    expect(entries[0].indent).toBe(0)
    expect(entries[1].task.id).toBe('MRKL-002')
  })

  it('includes blocks in searchText', () => {
    const tasks = [makeTask({ id: 'MRKL-003', blocks: ['MRKL-001', 'MRKL-002'] })]
    const entries = buildEntries(tasks)
    expect(entries[0].searchText).toContain('MRKL-001')
    expect(entries[0].searchText).toContain('MRKL-002')
  })

  it('returns empty array for empty input', () => {
    expect(buildEntries([])).toEqual([])
  })

  it('indents children under parent epics', () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', type: 'feat', title: 'Parent' }),
      makeTask({ id: 'MRKL-002', title: 'Child', parent: 'MRKL-001' }),
    ]
    const entries = buildEntries(tasks)
    const parent = entries.find((e) => e.task.id === 'MRKL-001')
    const child = entries.find((e) => e.task.id === 'MRKL-002')
    expect(parent?.indent).toBe(0)
    expect(child?.indent).toBe(1)
  })
})

describe('renderList', () => {
  function makeStateWithTasks(): ListRenderState {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'First task', type: 'feat', status: 'todo', priority: 5 }),
      makeTask({ id: 'MRKL-002', title: 'Second task', type: 'fix', status: 'in-progress', priority: 2 }),
      makeTask({ id: 'MRKL-003', title: 'Third task', type: 'chore', status: 'done' }),
    ]
    const entries = buildEntries(tasks)
    return makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
  }

  it('writes output containing tab bar', async () => {
    const state = makeStateWithTasks()
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 30)
    expect(screen).toContain('[Tasks]')
    expect(screen).toContain('Archive')
  })

  it('writes output containing search input marker', async () => {
    const state = makeStateWithTasks()
    state.query = 'bug'
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 30)
    expect(screen).toContain('bug')
  })

  it('writes output containing column headers', async () => {
    const state = makeStateWithTasks()
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 30)
    expect(screen).toContain('ID')
    expect(screen).toContain('STATUS')
    expect(screen).toContain('TITLE')
    expect(screen).toContain('Preview')
    expect(screen).not.toContain('TYPE')
  })

  it('writes output containing task IDs', async () => {
    const state = makeStateWithTasks()
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 30)
    expect(screen).toContain('MRKL-001')
    expect(screen).toContain('MRKL-002')
    expect(screen).toContain('MRKL-003')
  })

  it('clamps selectedIndex when out of range', () => {
    const state = makeStateWithTasks()
    state.selectedIndex = 99
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    expect(state.selectedIndex).toBe(2) // 3 entries, max index = 2
  })

  it('clamps selectedIndex to 0 when filtered is empty', () => {
    const state = makeListState({ filtered: [], allTasks: [] })
    state.selectedIndex = 5
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    expect(state.selectedIndex).toBe(0)
  })

  it('shows flag in preview when task has a flag', async () => {
    const flaggedTask = makeTask({
      id: 'MRKL-001',
      title: 'Flagged task',
      type: 'feat',
      status: 'todo',
      flag: 'needs-review',
    })
    const entries = buildEntries([flaggedTask])
    const state = makeListState({
      datasets: [{ label: 'Tasks', entries }, { label: 'Archive', entries: [] }],
      filtered: entries,
      allTasks: [flaggedTask],
    })
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 30)
    expect(screen).toContain('needs-review')
  })

  it('displays task count in bottom bar', () => {
    const state = makeStateWithTasks()
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const raw = stdout.getOutput()
    expect(raw).toContain('3/3')
  })
})

describe('render snapshots', () => {
  it('terminal too small snapshot at 25 cols', async () => {
    const stdout = createMockStdout(25, 24)
    renderList(makeListState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 25, 24)
    expect(screen).toContain('Terminal too small')
    expect(screen).toMatchSnapshot()
  })

  it('empty task list snapshot at 40 cols', async () => {
    const stdout = createMockStdout(40, 24)
    renderList(makeListState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 40, 24)
    expect(screen).toMatchSnapshot()
  })

  it('empty task list snapshot at 80 cols', async () => {
    const stdout = createMockStdout(80, 24)
    renderList(makeListState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('empty task list snapshot at 120 cols', async () => {
    const stdout = createMockStdout(120, 24)
    renderList(makeListState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 24)
    expect(screen).toMatchSnapshot()
  })

  it('basic task list snapshot at 80 cols', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'Add user authentication', type: 'feat', status: 'todo', priority: 5 }),
      makeTask({ id: 'MRKL-002', title: 'Fix login redirect bug', type: 'fix', status: 'in-progress', priority: 4 }),
      makeTask({ id: 'MRKL-003', title: 'Update CI pipeline config', type: 'chore', status: 'done' }),
      makeTask({ id: 'MRKL-004', title: 'Design dashboard layout', type: 'feat', status: 'todo', parent: 'MRKL-001', priority: 2 }),
      makeTask({ id: 'MRKL-005', title: 'Refactor token validation', type: 'fix', status: 'in-progress', priority: 1 }),
      makeTask({ id: 'MRKL-006', title: 'Write integration tests', type: 'test', status: 'todo' }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('epic grouping snapshot at 80 cols', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'Auth epic', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-002', title: 'Login page', type: 'feat', status: 'in-progress', parent: 'MRKL-001' }),
      makeTask({ id: 'MRKL-003', title: 'Token refresh', type: 'feat', status: 'todo', parent: 'MRKL-001' }),
      makeTask({ id: 'MRKL-004', title: 'Fix CI pipeline', type: 'chore', status: 'done' }),
      makeTask({ id: 'MRKL-005', title: 'Update README', type: 'chore', status: 'todo' }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('blocking indicators snapshot at 80 cols', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-010', title: 'Database migration', type: 'feat', status: 'todo', blocks: ['MRKL-011', 'MRKL-012'], priority: 5 }),
      makeTask({ id: 'MRKL-011', title: 'API endpoints', type: 'feat', status: 'todo', priority: 4 }),
      makeTask({ id: 'MRKL-012', title: 'Frontend integration', type: 'feat', status: 'todo' }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('wraps long relationship ID lists with aligned continuation lines', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-050', title: 'blocker task', type: 'feat', status: 'todo', blocks: ['MRKL-051', 'MRKL-052', 'MRKL-053', 'MRKL-054', 'MRKL-055'], priority: 5 }),
      makeTask({ id: 'MRKL-051', title: 'task a', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-052', title: 'task b', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-053', title: 'task c', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-054', title: 'task d', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-055', title: 'task e', type: 'feat', status: 'todo' }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    // 80 cols → preview width ~33 chars, which is too narrow for 5 IDs on one line
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    // IDs should never be split across lines — each MRKL-0XX token stays intact
    const lines = screen.split('\n')
    const idPattern = /MRKL-05\d/g
    for (const line of lines) {
      const matches = line.match(idPattern)
      if (matches) {
        for (const id of matches) {
          // Each ID should appear fully on the line (not truncated)
          expect(line).toContain(id)
        }
      }
    }
    expect(screen).toMatchSnapshot()
  })

  it('archive tab active snapshot at 80 cols', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-020', title: 'Archived feature', type: 'feat', status: 'closed' }),
      makeTask({ id: 'MRKL-021', title: 'Old bugfix', type: 'fix', status: 'done' }),
    ]
    const archiveEntries = buildEntries(tasks)
    const state = makeListState({
      activeTab: 1,
      datasets: [
        { label: 'Tasks', entries: [] },
        { label: 'Archive', entries: archiveEntries },
      ],
      filtered: archiveEntries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('scroll offset snapshot at 80 cols', async () => {
    const tasks = Array.from({ length: 20 }, (_, i) =>
      makeTask({
        id: `MRKL-${String(i + 1).padStart(3, '0')}`,
        title: `Task number ${i + 1}`,
        type: i % 3 === 0 ? 'feat' : i % 3 === 1 ? 'fix' : 'chore',
        status: i % 3 === 0 ? 'todo' : i % 3 === 1 ? 'in-progress' : 'done',
      }),
    )
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
      scrollOffset: 3,
      selectedIndex: 5,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('mixed emoji widths snapshot at 80 cols', async () => {
    // Tasks with different priority+relationship emoji combos that have
    // different code-unit counts (e.g. ⏫🚧 vs ⏹️🛑).
    // padOrTruncate uses visualWidth so padding is emoji-aware.
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'Highest priority blocker', type: 'feat', status: 'todo', priority: 5, blocks: ['MRKL-003'] }),
      makeTask({ id: 'MRKL-002', title: 'Normal priority task', type: 'feat', status: 'in-progress', priority: 3 }),
      makeTask({ id: 'MRKL-003', title: 'Lowest blocked task', type: 'fix', status: 'todo', priority: 1 }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(80, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('title truncation snapshot at 40 cols', async () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'Implement user authentication with OAuth2 and SAML', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-002', title: 'Fix critical production database connection pooling', type: 'fix', status: 'in-progress' }),
      makeTask({ id: 'MRKL-003', title: 'Refactor legacy notification service infrastructure', type: 'chore', status: 'done' }),
    ]
    const entries = buildEntries(tasks)
    const state = makeListState({
      datasets: [
        { label: 'Tasks', entries },
        { label: 'Archive', entries: [] },
      ],
      filtered: entries,
      allTasks: tasks,
    })
    const stdout = createMockStdout(40, 24)
    renderList(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 40, 24)
    expect(screen).toMatchSnapshot()
  })
})

describe('interaction snapshots', () => {
  let tui: TuiProcess | null = null
  let tempDir: string

  function seedTaskFile(dir: string, id: string, title: string, type: string, status = 'todo', priority = 3): void {
    writeFileSync(
      join(dir, '.tasks', `${id}.md`),
      `---\nid: ${id}\ntitle: ${title}\ntype: ${type}\nstatus: ${status}\npriority: ${priority}\ncreated: '2026-01-01'\n---\n`,
    )
  }

  function seedArchivedTaskFile(dir: string, id: string, title: string, type: string, status = 'closed'): void {
    writeFileSync(
      join(dir, '.tasks', '.archive', `${id}.md`),
      `---\nid: ${id}\ntitle: ${title}\ntype: ${type}\nstatus: ${status}\ncreated: '2026-01-01'\n---\n`,
    )
  }

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'mrkl-list-interaction-'))
    mkdirSync(join(tempDir, '.tasks', '.archive'), { recursive: true })
    seedTaskFile(tempDir, 'MRKL-001', 'Auth epic', 'feat', 'todo', 5)
    seedTaskFile(tempDir, 'MRKL-002', 'Fix login bug', 'fix', 'in-progress', 4)
    seedTaskFile(tempDir, 'MRKL-003', 'Auth tests', 'test', 'todo', 2)
    seedTaskFile(tempDir, 'MRKL-004', 'Update CI config', 'chore', 'done')
    seedTaskFile(tempDir, 'MRKL-005', 'Dashboard layout', 'feat')
    seedArchivedTaskFile(tempDir, 'MRKL-099', 'Old feature', 'feat')
  })

  afterEach(() => {
    tui?.kill()
    tui = null
  })

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('initial render shows task list with first item selected', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    const screen = await tui.waitForContent('MRKL-001')
    expect(screen).toMatchSnapshot()
  })

  it('arrow down moves selection to next task', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('arrow up moves selection back to previous task', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('\x1b[B') // down
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\x1b[A') // up
    await new Promise((r) => setTimeout(r, 200))
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('typing characters filters the task list', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('/auth')
    const screen = await tui.waitForContent('auth epic')
    expect(screen).toMatchSnapshot()
  })

  it('Tab key switches between Tasks and Archive', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('\t')
    const screen = await tui.waitForContent('old feature')
    expect(screen).toMatchSnapshot()
  })

  it('Enter selects the highlighted task and opens edit TUI', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('\r')
    const screen = await tui.waitForContent('Edit Task')
    expect(screen).toMatchSnapshot()
  })

  it('Esc cancels and exits cleanly', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    tui.write('\x1b')
    const code = await tui.exitCode
    expect(code).toBe(0)
  })

  it('search uses exact substring matching not fuzzy', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    // Type "003" — should match only MRKL-003, not fuzzy-match others
    tui.write('/003')
    // Wait for filter to show 1/5 count (only MRKL-003 matches)
    const screen = await tui.waitForContent('1/5')
    expect(screen).toContain('MRKL-003')
    expect(screen).not.toContain('MRKL-001')
    expect(screen).not.toContain('MRKL-004')
    expect(screen).not.toContain('MRKL-005')
  })

  it('--search flag pre-fills query and filters results', async () => {
    tui = spawnTui('list --search auth', { cols: 80, rows: 24, cwd: tempDir })
    const screen = await tui.waitForContent('auth epic')
    // Search bar should show "/ auth" (query pre-filled, not in active search mode)
    expect(screen).toMatch(/^\/\s*auth\s*$/m)
    // Only auth-related tasks should appear
    expect(screen).toContain('auth epic')
    expect(screen).toContain('auth tests')
    // Non-matching tasks should be filtered out
    expect(screen).not.toContain('update ci')
    expect(screen).not.toContain('dashboard')
  })

  it('pressing s cycles sort field and flattens display', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    // Press 's' to cycle to priority sort
    tui.write('s')
    const screen = await tui.waitForContent('priority')
    // Should show sort indicator in status bar
    expect(screen).toMatch(/priority/i)
    // Tasks should be reordered by priority (MRKL-001 p5 first, then MRKL-002 p4)
    const lines = screen.split('\n')
    const idx001 = lines.findIndex((l) => l.includes('MRKL-001'))
    const idx002 = lines.findIndex((l) => l.includes('MRKL-002'))
    expect(idx001).toBeLessThan(idx002)
  })

  it('pressing d toggles sort direction', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')
    // Press 's' for priority sort (desc by default), then 'd' to toggle to asc
    tui.write('s')
    await tui.waitForContent('priority')
    tui.write('d')
    const screen = await tui.waitForContent('▲')
    expect(screen).toContain('▲')
  })

  it('live reloads when a new task file is created on disk', async () => {
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-001')

    // Verify the new task doesn't exist yet
    const screen = tui.readScreen()
    expect(screen).not.toContain('MRKL-006')

    // Create a new task file externally
    seedTaskFile(tempDir, 'MRKL-006', 'Live reload task', 'feat')

    // Wait for the watcher debounce + re-render
    const updated = await tui.waitForContent('MRKL-006', 3000)
    expect(updated).toContain('MRKL-006')
    expect(updated).toContain('live reload')
  })

  it('live reloads when a task file is deleted on disk', async () => {
    // Ensure MRKL-006 exists from previous test setup
    seedTaskFile(tempDir, 'MRKL-007', 'Temporary task', 'chore')
    tui = spawnTui('list', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('MRKL-007')

    // Delete the task file externally
    unlinkSync(join(tempDir, '.tasks', 'MRKL-007.md'))

    // Wait for watcher to pick up deletion
    await new Promise((r) => setTimeout(r, 500))
    const screen = tui.readScreen()
    expect(screen).not.toContain('MRKL-007')
  })
})
