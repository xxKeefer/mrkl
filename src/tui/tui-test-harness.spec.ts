import { describe, it, expect } from 'vitest'
import { createMockStdout, renderToScreen, makeTask, makeFormState, makeListState } from './tui-test-harness.js'
import { CLEAR_SCREEN, BOLD, RESET, FG_CYAN } from './ansi.js'
import { TASK_TYPES, STATUSES } from '../types.js'

describe('createMockStdout', () => {
  it('returns object with configured columns and rows', () => {
    const stdout = createMockStdout(120, 40)
    expect(stdout.columns).toBe(120)
    expect(stdout.rows).toBe(40)
  })

  it('captures written data and returns it via getOutput', () => {
    const stdout = createMockStdout(80, 24)
    stdout.write('hello ')
    stdout.write('world')
    expect(stdout.getOutput()).toBe('hello world')
  })

  it('reset clears the captured buffer', () => {
    const stdout = createMockStdout(80, 24)
    stdout.write('first render')
    stdout.reset()
    expect(stdout.getOutput()).toBe('')
    stdout.write('second render')
    expect(stdout.getOutput()).toBe('second render')
  })
})

describe('renderToScreen', () => {
  it('renders plain text to the screen buffer', async () => {
    const result = await renderToScreen('hello world', 80, 24)
    expect(result).toContain('hello world')
  })

  it('strips ANSI color codes from output', async () => {
    const ansi = `${FG_CYAN}${BOLD}colored text${RESET}`
    const result = await renderToScreen(ansi, 80, 24)
    expect(result).toContain('colored text')
    expect(result).not.toContain('\x1b[')
  })

  it('CLEAR_SCREEN resets buffer — only post-clear content appears', async () => {
    const ansi = `before${CLEAR_SCREEN}after`
    const result = await renderToScreen(ansi, 80, 24)
    expect(result).toContain('after')
    expect(result).not.toContain('before')
  })

  it('cursor positioning places content at correct position', async () => {
    // Move cursor to row 2, col 5 then write
    const ansi = '\x1b[2;5Hplaced'
    const result = await renderToScreen(ansi, 80, 24)
    const lines = result.split('\n')
    // Row 2 (index 1) should contain 'placed' starting at col 5 (index 4)
    expect(lines[1]?.slice(4, 10)).toBe('placed')
  })
})

describe('makeTask', () => {
  it('returns valid TaskData with sensible defaults', () => {
    const task = makeTask()
    expect(task.id).toBe('TEST-001')
    expect(task.type).toBe('feat')
    expect(task.status).toBe('todo')
    expect(task.title).toBe('Test task')
    expect(task.description).toBe('')
    expect(task.acceptance_criteria).toEqual([])
    expect(task.created).toMatch(/^\d{4}-\d{2}-\d{2}/)
    expect(TASK_TYPES).toContain(task.type)
    expect(STATUSES).toContain(task.status)
  })

  it('accepts overrides', () => {
    const task = makeTask({ id: 'MRKL-042', title: 'Custom', status: 'done', blocks: ['MRKL-001'] })
    expect(task.id).toBe('MRKL-042')
    expect(task.title).toBe('Custom')
    expect(task.status).toBe('done')
    expect(task.blocks).toEqual(['MRKL-001'])
    // Non-overridden fields keep defaults
    expect(task.type).toBe('feat')
    expect(task.description).toBe('')
  })
})

describe('makeFormState', () => {
  it('returns valid FormState with all required fields', () => {
    const state = makeFormState()
    expect(state.type).toBe(0)
    expect(state.status).toBe(0)
    expect(state.title).toBe('')
    expect(state.description).toBe('')
    expect(state.parent).toBe('')
    expect(state.parentInput).toBe('')
    expect(state.parentCandidates).toEqual([])
    expect(state.parentHighlight).toBe(0)
    expect(state.blocks).toEqual([])
    expect(state.currentBlock).toBe('')
    expect(state.blockCandidates).toEqual([])
    expect(state.blockHighlight).toBe(0)
    expect(state.criteria).toEqual([])
    expect(state.currentCriterion).toBe('')
    expect(state.activeField).toBe(0)
    expect(state.cursorPos).toBe(0)
    expect(state.error).toBe('')
    expect(state.mode).toBe('create')
    expect(state.taskId).toBeUndefined()
  })

  it('accepts overrides', () => {
    const state = makeFormState({ mode: 'edit', taskId: 'MRKL-001', title: 'Edited', status: 2 })
    expect(state.mode).toBe('edit')
    expect(state.taskId).toBe('MRKL-001')
    expect(state.title).toBe('Edited')
    expect(state.status).toBe(2)
    // Non-overridden fields keep defaults
    expect(state.type).toBe(0)
    expect(state.blocks).toEqual([])
  })
})

describe('makeListState', () => {
  it('returns valid ListRenderState with defaults', () => {
    const state = makeListState()
    expect(state.activeTab).toBe(0)
    expect(state.query).toBe('')
    expect(state.selectedIndex).toBe(0)
    expect(state.scrollOffset).toBe(0)
    expect(state.datasets).toHaveLength(2)
    expect(state.datasets[0].label).toBe('Tasks')
    expect(state.datasets[0].entries).toEqual([])
    expect(state.datasets[1].label).toBe('Archive')
    expect(state.datasets[1].entries).toEqual([])
  })

  it('accepts overrides', () => {
    const state = makeListState({ activeTab: 1, query: 'bug' })
    expect(state.activeTab).toBe(1)
    expect(state.query).toBe('bug')
    expect(state.selectedIndex).toBe(0)
  })

  it('accepts datasets override', () => {
    const task = makeTask({ id: 'MRKL-005', title: 'Find bug' })
    const state = makeListState({
      datasets: [{
        label: 'Tasks',
        entries: [{
          task,
          searchText: `${task.id} ${task.title}`,
          indent: 0,
          blocksIndicator: null,
          blockedByIndicator: null,
          isEpic: false,
        }],
      }, { label: 'Archive', entries: [] }],
    })
    expect(state.datasets[0].entries).toHaveLength(1)
    expect(state.datasets[0].entries[0].task.id).toBe('MRKL-005')
  })
})
