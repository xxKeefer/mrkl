import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { filterCandidates, buildParentCandidates, render } from './create-tui.js'
import type { TaskData } from '../types.js'
import { createMockStdout, makeFormState, renderToScreen, spawnTui, type TuiProcess } from './tui-test-harness.js'

describe('filterCandidates', () => {
  const candidates = [
    { id: 'MRKL-001', label: 'MRKL-001 - epic task' },
    { id: 'MRKL-002', label: 'MRKL-002 - fix login bug' },
    { id: 'MRKL-003', label: 'MRKL-003 - standalone thing' },
  ]

  it('returns all candidates when input is empty', () => {
    const result = filterCandidates('', candidates)
    expect(result).toEqual(candidates)
  })

  it('filters by case-insensitive substring match on label', () => {
    const result = filterCandidates('epic', candidates)
    expect(result).toEqual([candidates[0]])
  })

  it('is case-insensitive', () => {
    const result = filterCandidates('FIX', candidates)
    expect(result).toEqual([candidates[1]])
  })

  it('excludes IDs in the exclude set', () => {
    const result = filterCandidates('', candidates, new Set(['MRKL-002']))
    expect(result).toEqual([candidates[0], candidates[2]])
  })

  it('respects the limit parameter', () => {
    const result = filterCandidates('', candidates, undefined, 2)
    expect(result).toEqual([candidates[0], candidates[1]])
  })

  it('defaults limit to 5', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      id: `T-${i}`,
      label: `T-${i} - task ${i}`,
    }))
    const result = filterCandidates('', many)
    expect(result).toHaveLength(5)
  })

  it('combines filter, exclude, and limit', () => {
    const result = filterCandidates('mrkl', candidates, new Set(['MRKL-001']), 1)
    expect(result).toEqual([candidates[1]])
  })
})

describe('buildParentCandidates', () => {
  const makeTask = (overrides: Partial<TaskData> & { id: string; title: string }): TaskData => ({
    type: 'feat',
    status: 'todo',
    created: '2026-01-01',
    description: '',
    acceptance_criteria: [],
    ...overrides,
  })

  it('maps tasks to id/label candidates', () => {
    const tasks = [makeTask({ id: 'MRKL-001', title: 'epic task' })]
    const result = buildParentCandidates(tasks)
    expect(result).toEqual([{ id: 'MRKL-001', label: 'MRKL-001 - epic task' }])
  })

  it('excludes tasks that already have a parent', () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'epic task' }),
      makeTask({ id: 'MRKL-002', title: 'child task', parent: 'MRKL-001' }),
    ]
    const result = buildParentCandidates(tasks)
    expect(result).toEqual([{ id: 'MRKL-001', label: 'MRKL-001 - epic task' }])
  })

  it('returns empty array when all tasks have parents', () => {
    const tasks = [
      makeTask({ id: 'MRKL-001', title: 'child', parent: 'MRKL-000' }),
    ]
    expect(buildParentCandidates(tasks)).toEqual([])
  })
})

describe('render', () => {
  it('writes form output to stdout with default create state', () => {
    const stdout = createMockStdout(80, 24)
    const state = makeFormState()
    render(state, stdout)
    const output = stdout.getOutput()
    expect(output).toContain('Create Task')
    expect(output).toContain('Type')
    expect(output).toContain('Title')
  })

  it('writes edit header when mode is edit', () => {
    const stdout = createMockStdout(80, 24)
    const state = makeFormState({ mode: 'edit', taskId: 'MRKL-042' })
    render(state, stdout)
    const output = stdout.getOutput()
    expect(output).toContain('Edit Task MRKL-042')
    expect(output).toContain('Status')
  })

  it('renders Flag field in create form', () => {
    const stdout = createMockStdout(80, 24)
    const state = makeFormState()
    render(state, stdout)
    const output = stdout.getOutput()
    expect(output).toContain('Flag')
  })

  it('renders Flag field with value in edit form', () => {
    const stdout = createMockStdout(80, 24)
    const state = makeFormState({ mode: 'edit', taskId: 'MRKL-001', flag: 'needs-review' })
    render(state, stdout)
    const output = stdout.getOutput()
    expect(output).toContain('Flag')
    expect(output).toContain('needs-review')
  })

  it('empty create form snapshot at 40 cols', async () => {
    const stdout = createMockStdout(40, 24)
    render(makeFormState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 40, 24)
    expect(screen).toMatchSnapshot()
  })

  it('empty create form snapshot at 80 cols', async () => {
    const stdout = createMockStdout(80, 24)
    render(makeFormState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('empty create form snapshot at 120 cols', async () => {
    const stdout = createMockStdout(120, 24)
    render(makeFormState(), stdout)
    const screen = await renderToScreen(stdout.getOutput(), 120, 24)
    expect(screen).toMatchSnapshot()
  })

  it('filled create form snapshot at 80 cols', async () => {
    const state = makeFormState({
      type: 2,
      title: 'Implement user authentication',
      description: 'Add JWT-based auth with refresh tokens',
      parent: 'MRKL-010',
      parentInput: 'MRKL-010 - Auth epic',
      blocks: ['MRKL-011', 'MRKL-012'],
      criteria: ['Login endpoint returns JWT', 'Refresh token rotation works'],
      activeField: 2,
      cursorPos: 29,
    })
    const stdout = createMockStdout(80, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('edit mode form with status field snapshot at 80 cols', async () => {
    const state = makeFormState({
      mode: 'edit',
      taskId: 'MRKL-042',
      type: 0,
      status: 1,
      title: 'Fix login redirect',
      description: 'Users are redirected to wrong page after login',
      criteria: ['Redirect goes to dashboard'],
      activeField: 0,
    })
    const stdout = createMockStdout(80, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('error state (empty title) snapshot at 80 cols', async () => {
    const state = makeFormState({
      error: 'Title cannot be empty',
      activeField: 2,
      cursorPos: 0,
    })
    const stdout = createMockStdout(80, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('active autocomplete with suggestions snapshot at 80 cols', async () => {
    const state = makeFormState({
      activeField: 5,
      parentInput: 'auth',
      cursorPos: 4,
      parentCandidates: [
        { id: 'MRKL-010', label: 'MRKL-010 - Auth epic' },
        { id: 'MRKL-020', label: 'MRKL-020 - Auth refactor' },
        { id: 'MRKL-030', label: 'MRKL-030 - Auth tests' },
      ],
      parentHighlight: 1,
    })
    const stdout = createMockStdout(80, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('long text wrapping snapshot at 40 cols', async () => {
    const state = makeFormState({
      title: 'A very long task title that should wrap at narrow width',
      description: 'This description contains enough text to demonstrate how the form handles word wrapping when the terminal is very narrow',
      criteria: ['First criterion with a long description that wraps'],
      activeField: 3,
      cursorPos: 0,
    })
    const stdout = createMockStdout(40, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 40, 24)
    expect(screen).toMatchSnapshot()
  })
})

describe('interaction snapshots', () => {
  let tui: TuiProcess | null = null

  afterEach(() => {
    tui?.kill()
    tui = null
  })

  it('initial render shows type field highlighted', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    const screen = await tui.waitForContent('feat')
    expect(screen).toMatchSnapshot()
  })

  it('arrow down moves to priority field', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    await tui.waitForContent('feat')
    tui.write('\x1b[B')
    await tui.waitForContent('Priority')
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('arrow up returns to type field', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    await tui.waitForContent('feat')
    tui.write('\x1b[B') // down to priority
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\x1b[A') // up back to type
    await new Promise((r) => setTimeout(r, 200))
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('left/right arrows cycle type options', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    await tui.waitForContent('feat')
    tui.write('\x1b[C') // right → fix
    const fixScreen = await tui.waitForContent('fix')
    expect(fixScreen).toMatchSnapshot()
    tui.write('\x1b[D') // left → back to feat
    const featScreen = await tui.waitForContent('feat')
    expect(featScreen).toMatchSnapshot()
  })

  it('typing characters into title field shows text on screen', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    await tui.waitForContent('feat')
    tui.write('\x1b[B\x1b[B') // down to priority, then title
    await new Promise((r) => setTimeout(r, 200))
    tui.write('Hello')
    await tui.waitForContent('Hello')
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('pressing Enter on filled form triggers submit', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
    mkdirSync(join(tempDir, '.tasks', '.archive'), { recursive: true })

    try {
      tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
      await tui.waitForContent('feat')
      tui.write('\x1b[B\x1b[B') // down to priority, then title
      await new Promise((r) => setTimeout(r, 200))
      tui.write('Test task')
      await tui.waitForContent('Test task')
      // Enter through: title → desc → flag → parent → blocks +Add → criteria +Add (empty = submit)
      for (let i = 0; i < 5; i++) {
        tui.write('\r')
        await new Promise((r) => setTimeout(r, 100))
      }
      const code = await tui.exitCode
      expect(code).toBe(0)
      const screen = tui.readScreen()
      expect(screen).toMatchSnapshot()
      const taskFiles = readdirSync(join(tempDir, '.tasks')).filter(
        (f) => f.endsWith('.md'),
      )
      expect(taskFiles).toHaveLength(1)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('pressing Esc cancels form', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24 })
    await tui.waitForContent('feat')
    tui.write('\x1b')
    const code = await tui.exitCode
    expect(code).toBe(0)
  })
})

describe('autocomplete interaction snapshots', () => {
  let tui: TuiProcess | null = null
  let tempDir: string

  function seedTaskFile(dir: string, id: string, title: string, type: string): void {
    writeFileSync(
      join(dir, '.tasks', `${id}.md`),
      `---\nid: ${id}\ntitle: ${title}\ntype: ${type}\nstatus: todo\ncreated: '2026-01-01'\n---\n`,
    )
  }

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'mrkl-autocomplete-'))
    mkdirSync(join(tempDir, '.tasks', '.archive'), { recursive: true })
    seedTaskFile(tempDir, 'MRKL-001', 'Auth epic', 'feat')
    seedTaskFile(tempDir, 'MRKL-002', 'Fix login bug', 'fix')
    seedTaskFile(tempDir, 'MRKL-003', 'Auth tests', 'test')
  })

  afterEach(() => {
    tui?.kill()
    tui = null
  })

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('typing in parent field shows filtered suggestions', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('feat')
    // Navigate to parent field (index 5): type→priority→title→desc→flag→parent
    tui.write('\x1b[B\x1b[B\x1b[B\x1b[B\x1b[B')
    await new Promise((r) => setTimeout(r, 300))
    tui.write('auth')
    const screen = await tui.waitForContent('Auth epic')
    expect(screen).toMatchSnapshot()
  })

  it('right arrow navigates suggestion highlight', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('feat')
    tui.write('\x1b[B\x1b[B\x1b[B\x1b[B\x1b[B')
    await new Promise((r) => setTimeout(r, 300))
    tui.write('MRKL')
    await tui.waitForContent('MRKL-001')
    tui.write('\x1b[C') // right arrow → move highlight to index 1
    await new Promise((r) => setTimeout(r, 200))
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('Enter selects highlighted suggestion', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('feat')
    tui.write('\x1b[B\x1b[B\x1b[B\x1b[B\x1b[B')
    await new Promise((r) => setTimeout(r, 300))
    tui.write('auth')
    await tui.waitForContent('Auth epic')
    tui.write('\x1b[C') // highlight "MRKL-003 - Auth tests" (index 1)
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\r') // select it
    await tui.waitForContent('Auth tests')
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })

  it('Enter on empty parent field skips to next field without selecting', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('feat')
    // Navigate to parent field (index 5): type→priority→title→desc→flag→parent
    tui.write('\x1b[B\x1b[B\x1b[B\x1b[B\x1b[B')
    await new Promise((r) => setTimeout(r, 300))
    // Don't type anything — press Enter on empty autocomplete
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 300))
    const screen = tui.readScreen()
    // Should advance to +Block field, NOT select a suggestion into parent
    expect(screen).toContain('+ Block')
    // Parent field should show placeholder (empty), not a selected task
    const parentLine = screen.split('\n').find((l) => l.includes('Parent'))
    expect(parentLine).toContain('type to search...')
    expect(screen).toMatchSnapshot()
  })

  it('Enter on empty +Block field skips without selecting a suggestion', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: tempDir })
    await tui.waitForContent('feat')
    // Navigate to +Block field (index 6): type→priority→title→desc→flag→parent→+Block
    for (let i = 0; i < 6; i++) {
      tui.write('\x1b[B')
      await new Promise((r) => setTimeout(r, 100))
    }
    await new Promise((r) => setTimeout(r, 200))
    // Don't type anything — press Enter on empty +Block autocomplete
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 300))
    const screen = tui.readScreen()
    // Should NOT have added any blocks (no "Blocks 1" label)
    expect(screen).not.toMatch(/Blocks\s+1/)
    expect(screen).toMatchSnapshot()
  })
})
