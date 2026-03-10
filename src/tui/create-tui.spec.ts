import { describe, it, expect } from 'vitest'
import { filterCandidates, buildParentCandidates, render } from './create-tui.js'
import type { TaskData } from '../types.js'
import { createMockStdout, makeFormState } from './tui-test-harness.js'

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
})
