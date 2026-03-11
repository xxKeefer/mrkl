import { describe, it, expect } from 'vitest'
import { buildEntries, renderList } from './list-tui.js'
import type { ListRenderState } from './list-tui.js'
import { makeTask, makeListState, createMockStdout, renderToScreen } from './tui-test-harness.js'

describe('buildEntries', () => {
  it('produces FzfEntry[] from flat tasks', () => {
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
      makeTask({ id: 'MRKL-001', title: 'First task', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-002', title: 'Second task', type: 'fix', status: 'in-progress' }),
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
    expect(screen).toContain('TYPE')
    expect(screen).toContain('STATUS')
    expect(screen).toContain('TITLE')
    expect(screen).toContain('Preview')
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

  it('displays task count in bottom bar', () => {
    const state = makeStateWithTasks()
    const stdout = createMockStdout(120, 30)
    renderList(state, stdout)
    const raw = stdout.getOutput()
    expect(raw).toContain('3/3')
  })
})

describe('render snapshots', () => {
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
      makeTask({ id: 'MRKL-001', title: 'Add user authentication', type: 'feat', status: 'todo' }),
      makeTask({ id: 'MRKL-002', title: 'Fix login redirect bug', type: 'fix', status: 'in-progress' }),
      makeTask({ id: 'MRKL-003', title: 'Update CI pipeline config', type: 'chore', status: 'done' }),
      makeTask({ id: 'MRKL-004', title: 'Design dashboard layout', type: 'feat', status: 'todo', parent: 'MRKL-001' }),
      makeTask({ id: 'MRKL-005', title: 'Refactor token validation', type: 'fix', status: 'in-progress' }),
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
})
