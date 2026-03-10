import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { render } from '../template.js'
import { findTaskFile, listArchivedTasks } from '../task.js'
import type { TaskData } from '../types.js'

vi.mock('../logger.js', () => ({
  logger: {
    prompt: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    done: vi.fn(),
    flag: vi.fn(),
  },
}))

import { logger } from '../logger.js'
import doneCommand from './done.js'

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

async function runDone(dir: string, id: string): Promise<void> {
  const origCwd = process.cwd()
  const origExit = process.exit
  process.chdir(dir)
  process.exit = vi.fn() as never
  try {
    await doneCommand.run!({ args: { id, _: [] } } as never)
  } finally {
    process.chdir(origCwd)
    process.exit = origExit
  }
}

describe('done command', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mrkl-done-'))
    setupProject(dir)
    vi.clearAllMocks()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('closes task without prompt when it has no children', async () => {
    const task = makeTask({ id: 'TEST-001', title: 'solo task' })
    writeTask(dir, task)

    await runDone(dir, 'TEST-001')

    expect(logger.prompt).not.toHaveBeenCalled()
    const archived = listArchivedTasks({ dir })
    expect(archived).toHaveLength(1)
    expect(archived[0].status).toBe('done')
  })

  it('cancels when user selects cancel on epic', async () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child = makeTask({ id: 'TEST-002', title: 'child', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child)

    vi.mocked(logger.prompt).mockResolvedValueOnce('cancel')

    await runDone(dir, 'TEST-001')

    // Parent should still be active
    const { task } = findTaskFile(dir, 'TEST-001')
    expect(task.status).toBe('todo')
    // Child should still be active with parent
    const { task: childTask } = findTaskFile(dir, 'TEST-002')
    expect(childTask.parent).toBe('TEST-001')
  })

  it('cascades done to all children when user selects cascade', async () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child1 = makeTask({ id: 'TEST-002', title: 'child one', parent: 'TEST-001' })
    const child2 = makeTask({ id: 'TEST-003', title: 'child two', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child1)
    writeTask(dir, child2)

    vi.mocked(logger.prompt).mockResolvedValueOnce('cascade')

    await runDone(dir, 'TEST-001')

    const archived = listArchivedTasks({ dir })
    expect(archived).toHaveLength(3)
    expect(archived.every((t) => t.status === 'done')).toBe(true)
  })

  it('orphans children when user selects orphan', async () => {
    const parent = makeTask({ id: 'TEST-001', title: 'epic' })
    const child = makeTask({ id: 'TEST-002', title: 'child', parent: 'TEST-001' })
    writeTask(dir, parent)
    writeTask(dir, child)

    vi.mocked(logger.prompt).mockResolvedValueOnce('orphan')

    await runDone(dir, 'TEST-001')

    // Parent should be archived
    const { task: parentTask, inArchive } = findTaskFile(dir, 'TEST-001')
    expect(inArchive).toBe(true)
    expect(parentTask.status).toBe('done')
    // Child should still be active, no parent, with orphan flag
    const { task: childTask, inArchive: childArchived } = findTaskFile(dir, 'TEST-002')
    expect(childArchived).toBe(false)
    expect(childTask.parent).toBeUndefined()
    expect(childTask.flag).toBe('<orphan of TEST-001>')
  })
})
