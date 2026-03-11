import { describe, it, expect } from 'vitest'
import { filterCandidates, buildParentCandidates, render } from './create-tui.js'
import type { TaskData } from '../types.js'
import { createMockStdout, makeFormState, renderToScreen } from './tui-test-harness.js'

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
      activeField: 1,
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
      activeField: 1,
      cursorPos: 0,
    })
    const stdout = createMockStdout(80, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 80, 24)
    expect(screen).toMatchSnapshot()
  })

  it('active autocomplete with suggestions snapshot at 80 cols', async () => {
    const state = makeFormState({
      activeField: 3,
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
      activeField: 2,
      cursorPos: 0,
    })
    const stdout = createMockStdout(40, 24)
    render(state, stdout)
    const screen = await renderToScreen(stdout.getOutput(), 40, 24)
    expect(screen).toMatchSnapshot()
  })
})
