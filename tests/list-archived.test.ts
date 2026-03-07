import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { initConfig } from '../src/config.js'
import { createTask, listArchivedTasks, closeTask } from '../src/task.js'
import { render } from '../src/template.js'
import type { TaskData } from '../src/types.js'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'mrkl-test-archive-'))
  initConfig(tmp, { prefix: 'TEST', verbose_files: true })
})

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

describe('listArchivedTasks', () => {
  function writeArchivedTask(task: TaskData): void {
    const filename = `${task.id} ${task.type} - ${task.title}.md`
    writeFileSync(join(tmp, '.tasks', '.archive', filename), render(task))
  }

  it('returns empty array when archive dir is empty', () => {
    expect(listArchivedTasks({ dir: tmp })).toEqual([])
  })

  it('returns archived tasks', () => {
    writeArchivedTask({
      id: 'TEST-001',
      type: 'feat',
      status: 'done',
      created: '2026-01-15',
      title: 'archived task',
      description: 'A description',
      acceptance_criteria: ['criterion 1'],
    })

    const tasks = listArchivedTasks({ dir: tmp })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('TEST-001')
    expect(tasks[0].status).toBe('done')
    expect(tasks[0].description).toBe('A description')
  })

  it('filters by type', () => {
    writeArchivedTask({
      id: 'TEST-001',
      type: 'feat',
      status: 'done',
      created: '2026-01-15',
      title: 'feature',
      description: '',
      acceptance_criteria: [],
    })
    writeArchivedTask({
      id: 'TEST-002',
      type: 'fix',
      status: 'done',
      created: '2026-01-16',
      title: 'bugfix',
      description: '',
      acceptance_criteria: [],
    })

    expect(listArchivedTasks({ dir: tmp, type: 'feat' })).toHaveLength(1)
    expect(listArchivedTasks({ dir: tmp, type: 'fix' })).toHaveLength(1)
    expect(listArchivedTasks({ dir: tmp, type: 'chore' })).toHaveLength(0)
  })

  it('filters by status', () => {
    writeArchivedTask({
      id: 'TEST-001',
      type: 'feat',
      status: 'done',
      created: '2026-01-15',
      title: 'done task',
      description: '',
      acceptance_criteria: [],
    })
    writeArchivedTask({
      id: 'TEST-002',
      type: 'feat',
      status: 'closed',
      created: '2026-01-16',
      title: 'closed task',
      description: '',
      acceptance_criteria: [],
    })

    expect(listArchivedTasks({ dir: tmp, status: 'done' })).toHaveLength(1)
    expect(listArchivedTasks({ dir: tmp, status: 'closed' })).toHaveLength(1)
    expect(listArchivedTasks({ dir: tmp, status: 'todo' })).toHaveLength(0)
  })

  it('works with closeTask done integration', () => {
    createTask({ dir: tmp, type: 'feat', title: 'to archive' })
    closeTask(tmp, 'TEST-001', 'completed', 'done')

    const tasks = listArchivedTasks({ dir: tmp })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('TEST-001')
    expect(tasks[0].status).toBe('done')
  })

  it('skips unparseable files', () => {
    writeArchivedTask({
      id: 'TEST-001',
      type: 'feat',
      status: 'done',
      created: '2026-01-15',
      title: 'valid',
      description: '',
      acceptance_criteria: [],
    })
    writeFileSync(join(tmp, '.tasks', '.archive', 'garbage.md'), 'not valid {{{')

    const tasks = listArchivedTasks({ dir: tmp })
    expect(tasks).toHaveLength(1)
  })
})
