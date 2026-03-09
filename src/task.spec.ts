import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { render } from './template.js'
import { getActiveChildren, orphanChildren, cascadeClose, findTaskFile, listArchivedTasks, groupByEpic, buildRelationshipIndicators } from './task.js'
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

describe('groupByEpic', () => {
  it('groups children under their parent epic', () => {
    const epic = makeTask({ id: 'TEST-001', title: 'epic' })
    const child1 = makeTask({ id: 'TEST-002', title: 'child one', parent: 'TEST-001' })
    const child2 = makeTask({ id: 'TEST-003', title: 'child two', parent: 'TEST-001' })
    const standalone = makeTask({ id: 'TEST-004', title: 'standalone' })

    const grouped = groupByEpic([epic, child1, child2, standalone])

    expect(grouped.map((g) => g.task.id)).toEqual([
      'TEST-001',
      'TEST-002',
      'TEST-003',
      'TEST-004',
    ])
    expect(grouped[0].indent).toBe(0)
    expect(grouped[1].indent).toBe(1)
    expect(grouped[2].indent).toBe(1)
    expect(grouped[3].indent).toBe(0)
  })

  it('places standalone tasks after epics with children', () => {
    const standalone = makeTask({ id: 'TEST-001', title: 'standalone' })
    const epic = makeTask({ id: 'TEST-002', title: 'epic' })
    const child = makeTask({ id: 'TEST-003', title: 'child', parent: 'TEST-002' })

    const grouped = groupByEpic([standalone, epic, child])

    expect(grouped.map((g) => g.task.id)).toEqual([
      'TEST-002',
      'TEST-003',
      'TEST-001',
    ])
  })

  it('handles tasks with no relationships', () => {
    const t1 = makeTask({ id: 'TEST-001', title: 'one' })
    const t2 = makeTask({ id: 'TEST-002', title: 'two' })

    const grouped = groupByEpic([t1, t2])

    expect(grouped).toHaveLength(2)
    expect(grouped.every((g) => g.indent === 0)).toBe(true)
  })

  it('includes blocks indicators', () => {
    const blocker = makeTask({ id: 'TEST-001', title: 'blocker', blocks: ['TEST-002'] })
    const blocked = makeTask({ id: 'TEST-002', title: 'blocked' })

    const grouped = groupByEpic([blocker, blocked])

    const blockerEntry = grouped.find((g) => g.task.id === 'TEST-001')!
    const blockedEntry = grouped.find((g) => g.task.id === 'TEST-002')!
    expect(blockerEntry.blocksIndicator).toBe('⛔► TEST-002')
    expect(blockedEntry.blockedByIndicator).toBe('◄⛔ TEST-001')
  })

  it('handles orphan children whose parent is not in the list', () => {
    const child = makeTask({ id: 'TEST-002', title: 'orphan child', parent: 'TEST-001' })
    const standalone = makeTask({ id: 'TEST-003', title: 'standalone' })

    const grouped = groupByEpic([child, standalone])

    // Orphan child should appear at indent 0 since parent isn't in list
    expect(grouped.every((g) => g.indent === 0)).toBe(true)
  })
})

describe('buildRelationshipIndicators', () => {
  it('returns blocks display for a task that blocks others', () => {
    const blocker = makeTask({ id: 'TEST-001', title: 'blocker', blocks: ['TEST-002', 'TEST-003'] })
    const t2 = makeTask({ id: 'TEST-002', title: 'two' })
    const t3 = makeTask({ id: 'TEST-003', title: 'three' })

    const result = buildRelationshipIndicators([blocker, t2, t3], blocker)

    expect(result.blocksDisplay).toBe('⛔► TEST-002, TEST-003')
    expect(result.blockedByDisplay).toBeNull()
  })

  it('returns blocked-by display for a task blocked by others', () => {
    const blocker = makeTask({ id: 'TEST-001', title: 'blocker', blocks: ['TEST-003'] })
    const t2 = makeTask({ id: 'TEST-002', title: 'also blocks', blocks: ['TEST-003'] })
    const blocked = makeTask({ id: 'TEST-003', title: 'blocked' })

    const result = buildRelationshipIndicators([blocker, t2, blocked], blocked)

    expect(result.blocksDisplay).toBeNull()
    expect(result.blockedByDisplay).toBe('◄⛔ TEST-001, TEST-002')
  })

  it('returns null for both when no relationships exist', () => {
    const task = makeTask({ id: 'TEST-001', title: 'solo' })

    const result = buildRelationshipIndicators([task], task)

    expect(result.blocksDisplay).toBeNull()
    expect(result.blockedByDisplay).toBeNull()
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
