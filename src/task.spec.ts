import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { render } from './template.js'
import { getActiveChildren, orphanChildren, cascadeClose, findTaskFile, listArchivedTasks } from './task.js'
import type { TaskData } from './types.js'

function makeTask(overrides: Partial<TaskData> & { id: string; title: string }): TaskData {
  return {
    type: 'feat',
    status: 'todo',
    created: '2026-01-01',
    description: '',
    acceptance_criteria: [],
    ...overrides,
  }
}

function setupProject(dir: string): void {
  mkdirSync(join(dir, '.tasks', '.archive'), { recursive: true })
  writeFileSync(join(dir, 'mrkl.toml'), 'prefix = "TEST"\ntasks_dir = ".tasks"\nverbose_files = false\n')
  writeFileSync(join(dir, '.tasks', '.counter'), '10')
}

function writeTask(dir: string, task: TaskData): void {
  writeFileSync(join(dir, '.tasks', `${task.id}.md`), render(task))
}

describe('getActiveChildren', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
    setupProject(dir)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns children that reference the given parent', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child1 = makeTask({ id: 'TEST-002', title: 'child one', parent: 'TEST-001' })
    const child2 = makeTask({ id: 'TEST-003', title: 'child two', parent: 'TEST-001' })
    const unrelated = makeTask({ id: 'TEST-004', title: 'unrelated' })

    writeTask(dir, parent)
    writeTask(dir, child1)
    writeTask(dir, child2)
    writeTask(dir, unrelated)

    const children = getActiveChildren(dir, 'TEST-001')
    expect(children).toHaveLength(2)
    expect(children.map((c) => c.id)).toEqual(['TEST-002', 'TEST-003'])
  })

  it('returns empty array when task has no children', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'solo task' })
    writeTask(dir, parent)

    const children = getActiveChildren(dir, 'TEST-001')
    expect(children).toEqual([])
  })
})

describe('orphanChildren', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
    setupProject(dir)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('removes parent and sets orphan flag on children', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child = makeTask({ id: 'TEST-002', title: 'child', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child)

    orphanChildren(dir, 'TEST-001')

    const { task } = findTaskFile(dir, 'TEST-002')
    expect(task.parent).toBeUndefined()
    expect(task.flag).toBe('<orphan of TEST-001>')
  })

  it('appends orphan marker to existing flag', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child = makeTask({ id: 'TEST-002', title: 'child', parent: 'TEST-001', flag: 'blocked' })
    writeTask(dir, parent)
    writeTask(dir, child)

    orphanChildren(dir, 'TEST-001')

    const { task } = findTaskFile(dir, 'TEST-002')
    expect(task.parent).toBeUndefined()
    expect(task.flag).toBe('blocked <orphan of TEST-001>')
  })
})

describe('cascadeClose', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
    setupProject(dir)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('archives all children with done status', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child1 = makeTask({ id: 'TEST-002', title: 'child one', parent: 'TEST-001' })
    const child2 = makeTask({ id: 'TEST-003', title: 'child two', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child1)
    writeTask(dir, child2)

    cascadeClose(dir, 'TEST-001', 'done')

    const archived = listArchivedTasks({ dir })
    expect(archived).toHaveLength(2)
    expect(archived.every((t) => t.status === 'done')).toBe(true)
    // Parent should still be active (not closed by cascadeClose)
    const active = getActiveChildren(dir, 'TEST-001')
    expect(active).toHaveLength(0)
  })

  it('archives all children with closed status', () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child = makeTask({ id: 'TEST-002', title: 'child', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child)

    cascadeClose(dir, 'TEST-001', 'closed')

    const archived = listArchivedTasks({ dir })
    expect(archived).toHaveLength(1)
    expect(archived[0].status).toBe('closed')
  })
})
