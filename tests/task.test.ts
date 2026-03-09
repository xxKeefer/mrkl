import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  mkdtempSync,
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { initConfig } from '../src/config.js'
import {
  createTask,
  listTasks,
  closeTask,
  resolveTaskId,
  normalizeTitle,
  parseCutoffDate,
  pruneTasks,
  executePrune,
  getChildren,
  getBlockedBy,
  validateParent,
  validateBlocks,
} from '../src/task.js'
import { render } from '../src/template.js'
import type { TaskData } from '../src/types.js'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
  initConfig(tmp, { prefix: 'TEST', verbose_files: true })
})

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

describe('normalizeTitle', () => {
  it('passes through a clean title', () => {
    expect(normalizeTitle('add login')).toBe('add login')
  })
  it('trims whitespace', () => {
    expect(normalizeTitle('  hello  ')).toBe('hello')
  })
  it('lowercases', () => {
    expect(normalizeTitle('Add Login')).toBe('add login')
  })
  it('replaces / with -', () => {
    expect(normalizeTitle('feat/login')).toBe('feat-login')
  })
  it('replaces \\ with -', () => {
    expect(normalizeTitle('feat\\login')).toBe('feat-login')
  })
  it('removes <', () => {
    expect(normalizeTitle('a<b')).toBe('ab')
  })
  it('removes >', () => {
    expect(normalizeTitle('a>b')).toBe('ab')
  })
  it('removes :', () => {
    expect(normalizeTitle('a:b')).toBe('ab')
  })
  it('removes "', () => {
    expect(normalizeTitle('a"b')).toBe('ab')
  })
  it('removes |', () => {
    expect(normalizeTitle('a|b')).toBe('ab')
  })
  it('removes ?', () => {
    expect(normalizeTitle('a?b')).toBe('ab')
  })
  it('removes *', () => {
    expect(normalizeTitle('a*b')).toBe('ab')
  })
  it('removes control characters', () => {
    expect(normalizeTitle('a\x00b\x1fc')).toBe('abc')
  })
  it('collapses consecutive spaces', () => {
    expect(normalizeTitle('a   b')).toBe('a b')
  })
  it('collapses consecutive dashes', () => {
    expect(normalizeTitle('a---b')).toBe('a-b')
  })
  it('trims leading and trailing dashes', () => {
    expect(normalizeTitle('-hello-')).toBe('hello')
  })
  it('handles complex combined input', () => {
    expect(normalizeTitle('  /Feat: <My> "Cool" | Title?*\\  ')).toBe(
      'feat my cool title',
    )
  })
  it('throws on empty string', () => {
    expect(() => normalizeTitle('')).toThrow(
      'Title is empty after normalisation',
    )
  })
  it('throws on all-invalid characters', () => {
    expect(() => normalizeTitle('<>:"|?*')).toThrow(
      'Title is empty after normalisation',
    )
  })
  it('throws on whitespace-only', () => {
    expect(() => normalizeTitle('   ')).toThrow(
      'Title is empty after normalisation',
    )
  })
})

describe('task', () => {
  describe('createTask', () => {
    it('creates a file with correct name format and returns TaskData', () => {
      const task = createTask({ dir: tmp, type: 'feat', title: 'add login' })
      expect(task.id).toBe('TEST-001')
      expect(task.type).toBe('feat')
      expect(task.title).toBe('add login')
      expect(task.status).toBe('todo')
      expect(
        existsSync(join(tmp, '.tasks', 'TEST-001 feat - add login.md')),
      ).toBe(true)
    })

    it('writes correct frontmatter and body', () => {
      createTask({
        dir: tmp,
        type: 'fix',
        title: 'broken auth',
        description: 'Fix the login bug.',
        acceptance_criteria: ['login works', 'tests pass'],
      })
      const content = readFileSync(
        join(tmp, '.tasks', 'TEST-001 fix - broken auth.md'),
        'utf-8',
      )
      expect(content).toContain('id: TEST-001')
      expect(content).toContain('type: fix')
      expect(content).toContain('status: todo')
      expect(content).toContain('## Description')
      expect(content).toContain('Fix the login bug.')
      expect(content).toContain('- [ ] login works')
      expect(content).toContain('- [ ] tests pass')
    })
    it('normalises the title in the filename on disk', () => {
      createTask({ dir: tmp, type: 'feat', title: '  My <Cool> Title  ' })
      expect(
        existsSync(join(tmp, '.tasks', 'TEST-001 feat - my cool title.md')),
      ).toBe(true)
    })
    it('returns normalised title in TaskData', () => {
      const task = createTask({ dir: tmp, type: 'feat', title: 'Feat/Login' })
      expect(task.title).toBe('feat-login')
    })
    it('throws when title is empty after normalisation', () => {
      expect(() =>
        createTask({ dir: tmp, type: 'feat', title: '***' }),
      ).toThrow('Title is empty after normalisation')
    })
    it('increments counter across creates', () => {
      const t1 = createTask({ dir: tmp, type: 'feat', title: 'first' })
      const t2 = createTask({ dir: tmp, type: 'fix', title: 'second' })
      expect(t1.id).toBe('TEST-001')
      expect(t2.id).toBe('TEST-002')
    })

    it('creates task with valid parent in frontmatter', () => {
      createTask({ dir: tmp, type: 'feat', title: 'epic' })
      const child = createTask({
        dir: tmp,
        type: 'feat',
        title: 'child',
        parent: 'TEST-001',
      })
      expect(child.parent).toBe('TEST-001')
      const content = readFileSync(
        join(tmp, '.tasks', 'TEST-002 feat - child.md'),
        'utf-8',
      )
      expect(content).toContain('parent: TEST-001')
    })

    it('creates task with valid blocks in frontmatter', () => {
      createTask({ dir: tmp, type: 'feat', title: 'blocked task' })
      const blocker = createTask({
        dir: tmp,
        type: 'fix',
        title: 'blocker',
        blocks: ['TEST-001'],
      })
      expect(blocker.blocks).toEqual(['TEST-001'])
      const content = readFileSync(
        join(tmp, '.tasks', 'TEST-002 fix - blocker.md'),
        'utf-8',
      )
      expect(content).toContain('blocks:')
      expect(content).toContain('TEST-001')
    })

    it('rejects nonexistent parent', () => {
      expect(() =>
        createTask({
          dir: tmp,
          type: 'feat',
          title: 'orphan',
          parent: 'TEST-999',
        }),
      ).toThrow('not found')
    })

    it('rejects archived parent', () => {
      createTask({ dir: tmp, type: 'feat', title: 'soon archived' })
      closeTask(tmp, 'TEST-001')
      expect(() =>
        createTask({
          dir: tmp,
          type: 'feat',
          title: 'child of archived',
          parent: 'TEST-001',
        }),
      ).toThrow('not found')
    })

    it('rejects parent that already has a parent (no nested epics)', () => {
      createTask({ dir: tmp, type: 'feat', title: 'grandparent' })
      createTask({
        dir: tmp,
        type: 'feat',
        title: 'parent',
        parent: 'TEST-001',
      })
      expect(() =>
        createTask({
          dir: tmp,
          type: 'feat',
          title: 'grandchild',
          parent: 'TEST-002',
        }),
      ).toThrow('already has a parent')
    })

    it('resolves numeric IDs for parent', () => {
      createTask({ dir: tmp, type: 'feat', title: 'epic' })
      const child = createTask({
        dir: tmp,
        type: 'feat',
        title: 'child',
        parent: '1',
      })
      expect(child.parent).toBe('TEST-001')
    })

    it('resolves numeric IDs for blocks', () => {
      createTask({ dir: tmp, type: 'feat', title: 'blocked' })
      const blocker = createTask({
        dir: tmp,
        type: 'fix',
        title: 'blocker',
        blocks: ['1'],
      })
      expect(blocker.blocks).toEqual(['TEST-001'])
    })

    it('rejects nonexistent blocks target', () => {
      expect(() =>
        createTask({
          dir: tmp,
          type: 'feat',
          title: 'bad blocker',
          blocks: ['TEST-999'],
        }),
      ).toThrow('not found')
    })
  })

  describe('listTasks', () => {
    it('returns all active tasks', () => {
      createTask({ dir: tmp, type: 'feat', title: 'one' })
      createTask({ dir: tmp, type: 'fix', title: 'two' })
      const tasks = listTasks({ dir: tmp })
      expect(tasks).toHaveLength(2)
      expect(tasks.map((t) => t.id)).toEqual(['TEST-001', 'TEST-002'])
    })
    it('filters by type and status', () => {
      createTask({ dir: tmp, type: 'feat', title: 'feature one' })
      createTask({ dir: tmp, type: 'fix', title: 'bugfix one' })
      createTask({ dir: tmp, type: 'feat', title: 'feature two' })

      expect(listTasks({ dir: tmp, type: 'feat' })).toHaveLength(2)
      expect(listTasks({ dir: tmp, type: 'fix' })).toHaveLength(1)
      expect(listTasks({ dir: tmp, status: 'todo' })).toHaveLength(3)
      expect(listTasks({ dir: tmp, status: 'done' })).toHaveLength(0)
    })
    it('returns empty array when no tasks exist', () => {
      expect(listTasks({ dir: tmp })).toEqual([])
    })
    it('skips files that fail to parse', () => {
      createTask({ dir: tmp, type: 'feat', title: 'valid task' })
      writeFileSync(
        join(tmp, '.tasks', 'not-a-task.md'),
        '# Just a README\nNo frontmatter here.',
      )
      const tasks = listTasks({ dir: tmp })
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe('TEST-001')
    })
  })

  describe('closeTask', () => {
    it('moves task to .archive and updates status to closed', () => {
      createTask({ dir: tmp, type: 'feat', title: 'close me' })
      closeTask(tmp, 'TEST-001')

      expect(
        existsSync(join(tmp, '.tasks', 'TEST-001 feat - close me.md')),
      ).toBe(false)
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - close me.md',
      )
      expect(existsSync(archivePath)).toBe(true)
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).toContain('status: closed')
    })
    it('accepts lowercase id', () => {
      createTask({ dir: tmp, type: 'feat', title: 'lower case' })
      closeTask(tmp, 'test-001')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - lower case.md',
      )
      expect(existsSync(archivePath)).toBe(true)
    })
    it('throws if task ID not found', () => {
      expect(() => closeTask(tmp, 'TEST-999')).toThrow(
        'Task TEST-999 not found',
      )
    })
    it('writes closed reason to frontmatter when provided', () => {
      createTask({ dir: tmp, type: 'feat', title: 'with reason' })
      closeTask(tmp, 'TEST-001', 'duplicate')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - with reason.md',
      )
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).toContain('flag: duplicate')
      expect(content).toContain('status: closed')
    })
    it('does not write closed field when no reason provided', () => {
      createTask({ dir: tmp, type: 'feat', title: 'no reason' })
      closeTask(tmp, 'TEST-001')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - no reason.md',
      )
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).not.toContain('flag:')
    })
    it('resolves numeric-only ID using project prefix', () => {
      createTask({ dir: tmp, type: 'feat', title: 'numeric id' })
      closeTask(tmp, '1')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - numeric id.md',
      )
      expect(existsSync(archivePath)).toBe(true)
    })
    it('resolves zero-padded numeric ID', () => {
      createTask({ dir: tmp, type: 'feat', title: 'padded id' })
      closeTask(tmp, '001')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - padded id.md',
      )
      expect(existsSync(archivePath)).toBe(true)
    })
  })

  describe('resolveTaskId', () => {
    it('prefixes numeric-only ID with config prefix', () => {
      expect(resolveTaskId(tmp, '1')).toBe('TEST-001')
    })
    it('pads numeric ID to 3 digits', () => {
      expect(resolveTaskId(tmp, '42')).toBe('TEST-042')
    })
    it('leaves already-padded numeric ID as-is', () => {
      expect(resolveTaskId(tmp, '001')).toBe('TEST-001')
    })
    it('passes through full ID unchanged', () => {
      expect(resolveTaskId(tmp, 'TEST-001')).toBe('TEST-001')
    })
  })

  describe('closeTask with status=done', () => {
    it('moves task to .archive with status done and flag completed', () => {
      createTask({ dir: tmp, type: 'feat', title: 'done me' })
      closeTask(tmp, 'TEST-001', 'completed', 'done')

      expect(
        existsSync(join(tmp, '.tasks', 'TEST-001 feat - done me.md')),
      ).toBe(false)
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - done me.md',
      )
      expect(existsSync(archivePath)).toBe(true)
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).toContain('status: done')
      expect(content).toContain('flag: completed')
    })
    it('checks acceptance criteria when status is done', () => {
      createTask({
        dir: tmp,
        type: 'feat',
        title: 'with acs',
        acceptance_criteria: ['login works', 'tests pass'],
      })
      closeTask(tmp, 'TEST-001', 'completed', 'done')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - with acs.md',
      )
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).toContain('- [x] login works')
      expect(content).toContain('- [x] tests pass')
      expect(content).not.toContain('- [ ]')
    })
    it('does not check criteria when status is closed', () => {
      createTask({
        dir: tmp,
        type: 'feat',
        title: 'closed acs',
        acceptance_criteria: ['should stay unchecked'],
      })
      closeTask(tmp, 'TEST-001', 'duplicate')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - closed acs.md',
      )
      const content = readFileSync(archivePath, 'utf-8')
      expect(content).toContain('- [ ] should stay unchecked')
    })
    it('resolves numeric ID', () => {
      createTask({ dir: tmp, type: 'feat', title: 'numeric done' })
      closeTask(tmp, '1', 'completed', 'done')
      const archivePath = join(
        tmp,
        '.tasks',
        '.archive',
        'TEST-001 feat - numeric done.md',
      )
      expect(existsSync(archivePath)).toBe(true)
    })
  })

  describe('createTask with verbose_files false', () => {
    let nonVerboseTmp: string

    beforeEach(() => {
      nonVerboseTmp = mkdtempSync(join(tmpdir(), 'mrkl-test-nv-'))
      initConfig(nonVerboseTmp, { prefix: 'TEST', verbose_files: false })
    })

    afterEach(() => {
      rmSync(nonVerboseTmp, { recursive: true, force: true })
    })

    it('produces non-verbose filename', () => {
      const task = createTask({
        dir: nonVerboseTmp,
        type: 'feat',
        title: 'add login',
      })
      expect(task.id).toBe('TEST-001')
      expect(existsSync(join(nonVerboseTmp, '.tasks', 'TEST-001.md'))).toBe(
        true,
      )
    })

    it('listTasks works with non-verbose filenames', () => {
      createTask({ dir: nonVerboseTmp, type: 'feat', title: 'one' })
      createTask({ dir: nonVerboseTmp, type: 'fix', title: 'two' })
      const tasks = listTasks({ dir: nonVerboseTmp })
      expect(tasks).toHaveLength(2)
      expect(tasks.map((t) => t.id)).toEqual(['TEST-001', 'TEST-002'])
    })

    it('closeTask with done status works with non-verbose filenames', () => {
      createTask({ dir: nonVerboseTmp, type: 'feat', title: 'done me' })
      closeTask(nonVerboseTmp, 'TEST-001', 'completed', 'done')
      expect(existsSync(join(nonVerboseTmp, '.tasks', 'TEST-001.md'))).toBe(
        false,
      )
      expect(
        existsSync(join(nonVerboseTmp, '.tasks', '.archive', 'TEST-001.md')),
      ).toBe(true)
      const content = readFileSync(
        join(nonVerboseTmp, '.tasks', '.archive', 'TEST-001.md'),
        'utf-8',
      )
      expect(content).toContain('status: done')
    })

    it('closeTask works with non-verbose filenames', () => {
      createTask({ dir: nonVerboseTmp, type: 'feat', title: 'close me' })
      closeTask(nonVerboseTmp, 'TEST-001')
      expect(existsSync(join(nonVerboseTmp, '.tasks', 'TEST-001.md'))).toBe(
        false,
      )
      expect(
        existsSync(join(nonVerboseTmp, '.tasks', '.archive', 'TEST-001.md')),
      ).toBe(true)
      const content = readFileSync(
        join(nonVerboseTmp, '.tasks', '.archive', 'TEST-001.md'),
        'utf-8',
      )
      expect(content).toContain('status: closed')
    })
  })

  describe('parseCutoffDate', () => {
    it('accepts YYYY-MM-DD format', () => {
      expect(parseCutoffDate('2026-03-01')).toBe('2026-03-01')
    })
    it('accepts YYYYMMDD format', () => {
      expect(parseCutoffDate('20260301')).toBe('2026-03-01')
    })
    it('rejects invalid formats', () => {
      expect(() => parseCutoffDate('03-01-2026')).toThrow('Invalid date format')
      expect(() => parseCutoffDate('2026/03/01')).toThrow('Invalid date format')
      expect(() => parseCutoffDate('not-a-date')).toThrow('Invalid date format')
    })
    it('rejects impossible dates', () => {
      expect(() => parseCutoffDate('2026-02-30')).toThrow(
        'not a real calendar date',
      )
      expect(() => parseCutoffDate('2026-13-01')).toThrow(
        'not a real calendar date',
      )
    })
  })

  describe('pruneTasks', () => {
    function writeArchivedTask(task: TaskData): void {
      const filename = `${task.id} ${task.type} - ${task.title}.md`
      writeFileSync(join(tmp, '.tasks', '.archive', filename), render(task))
    }

    it('returns tasks on or before cutoff', () => {
      writeArchivedTask({
        id: 'TEST-001',
        type: 'feat',
        status: 'done',
        created: '2026-01-15',
        title: 'old task',
        description: '',
        acceptance_criteria: [],
      })
      writeArchivedTask({
        id: 'TEST-002',
        type: 'fix',
        status: 'done',
        created: '2026-03-01',
        title: 'cutoff task',
        description: '',
        acceptance_criteria: [],
      })

      const result = pruneTasks(tmp, '2026-03-01')
      expect(result.deleted).toHaveLength(2)
      expect(result.deleted.map((d) => d.id)).toContain('TEST-001')
      expect(result.deleted.map((d) => d.id)).toContain('TEST-002')
    })

    it('excludes tasks after cutoff', () => {
      writeArchivedTask({
        id: 'TEST-001',
        type: 'feat',
        status: 'done',
        created: '2026-01-15',
        title: 'old task',
        description: '',
        acceptance_criteria: [],
      })
      writeArchivedTask({
        id: 'TEST-002',
        type: 'fix',
        status: 'done',
        created: '2026-03-02',
        title: 'new task',
        description: '',
        acceptance_criteria: [],
      })

      const result = pruneTasks(tmp, '2026-03-01')
      expect(result.deleted).toHaveLength(1)
      expect(result.deleted[0].id).toBe('TEST-001')
    })

    it('handles empty archive', () => {
      const result = pruneTasks(tmp, '2026-12-31')
      expect(result.deleted).toEqual([])
      expect(result.total).toBe(0)
    })

    it('handles unquoted YAML dates (Date objects)', () => {
      // gray-matter parses unquoted dates as JS Date objects
      // Write raw content with an unquoted date to trigger this
      const filename = 'TEST-001 feat - date object.md'
      const content = `---\nid: TEST-001\ntitle: date object\ntype: feat\nstatus: done\ncreated: 2026-01-15\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`
      writeFileSync(join(tmp, '.tasks', '.archive', filename), content)

      const result = pruneTasks(tmp, '2026-03-01')
      expect(result.deleted).toHaveLength(1)
      expect(result.deleted[0].created).toBe('2026-01-15')
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
      writeFileSync(
        join(tmp, '.tasks', '.archive', 'garbage.md'),
        'not valid frontmatter {{{',
      )

      const result = pruneTasks(tmp, '2026-12-31')
      expect(result.deleted).toHaveLength(1)
      expect(result.total).toBe(2)
    })
  })

  describe('relationship helpers', () => {
    const makeTasks = (): TaskData[] => [
      {
        id: 'TEST-001',
        type: 'feat',
        status: 'todo',
        created: '2026-01-01',
        title: 'epic task',
        description: '',
        acceptance_criteria: [],
      },
      {
        id: 'TEST-002',
        type: 'feat',
        status: 'todo',
        created: '2026-01-02',
        parent: 'TEST-001',
        title: 'child one',
        description: '',
        acceptance_criteria: [],
      },
      {
        id: 'TEST-003',
        type: 'fix',
        status: 'todo',
        created: '2026-01-03',
        parent: 'TEST-001',
        blocks: ['TEST-002'],
        title: 'child two blocks child one',
        description: '',
        acceptance_criteria: [],
      },
      {
        id: 'TEST-004',
        type: 'chore',
        status: 'todo',
        created: '2026-01-04',
        blocks: ['TEST-002', 'TEST-003'],
        title: 'standalone blocker',
        description: '',
        acceptance_criteria: [],
      },
    ]

    describe('getChildren', () => {
      it('returns tasks whose parent matches epicId', () => {
        const tasks = makeTasks()
        const children = getChildren(tasks, 'TEST-001')
        expect(children).toHaveLength(2)
        expect(children.map((t) => t.id)).toEqual(['TEST-002', 'TEST-003'])
      })

      it('returns empty array when no children exist', () => {
        const tasks = makeTasks()
        expect(getChildren(tasks, 'TEST-004')).toEqual([])
      })

      it('returns empty array for nonexistent epicId', () => {
        const tasks = makeTasks()
        expect(getChildren(tasks, 'TEST-999')).toEqual([])
      })
    })

    describe('getBlockedBy', () => {
      it('returns tasks that include taskId in their blocks array', () => {
        const tasks = makeTasks()
        const blockers = getBlockedBy(tasks, 'TEST-002')
        expect(blockers).toHaveLength(2)
        expect(blockers.map((t) => t.id)).toEqual(['TEST-003', 'TEST-004'])
      })

      it('returns empty array when nothing blocks the task', () => {
        const tasks = makeTasks()
        expect(getBlockedBy(tasks, 'TEST-001')).toEqual([])
      })

      it('returns empty array for nonexistent taskId', () => {
        const tasks = makeTasks()
        expect(getBlockedBy(tasks, 'TEST-999')).toEqual([])
      })
    })

    describe('validateParent', () => {
      it('returns valid for an existing task with no parent', () => {
        const tasks = makeTasks()
        const result = validateParent(tasks, 'TEST-001')
        expect(result).toEqual({ valid: true })
      })

      it('returns invalid when parent does not exist', () => {
        const tasks = makeTasks()
        const result = validateParent(tasks, 'TEST-999')
        expect(result.valid).toBe(false)
        expect(result.reason).toContain('not found')
      })

      it('returns invalid when parent is itself a child', () => {
        const tasks = makeTasks()
        const result = validateParent(tasks, 'TEST-002')
        expect(result.valid).toBe(false)
        expect(result.reason).toContain('parent')
      })
    })

    describe('validateBlocks', () => {
      it('returns valid when all block targets exist', () => {
        const tasks = makeTasks()
        const result = validateBlocks(tasks, ['TEST-001', 'TEST-002'])
        expect(result).toEqual({ valid: true })
      })

      it('returns invalid when a block target is missing', () => {
        const tasks = makeTasks()
        const result = validateBlocks(tasks, ['TEST-001', 'TEST-999'])
        expect(result.valid).toBe(false)
        expect(result.reason).toContain('TEST-999')
      })

      it('returns valid for empty array', () => {
        const tasks = makeTasks()
        expect(validateBlocks(tasks, [])).toEqual({ valid: true })
      })
    })

    it('demonstrates resolveTaskId usage before calling helpers', () => {
      const tasks = makeTasks()
      const resolvedId = resolveTaskId(tmp, '1')
      expect(resolvedId).toBe('TEST-001')
      const children = getChildren(tasks, resolvedId)
      expect(children).toHaveLength(2)
    })
  })

  describe('executePrune', () => {
    function writeArchivedTask(task: TaskData): string {
      const filename = `${task.id} ${task.type} - ${task.title}.md`
      writeFileSync(join(tmp, '.tasks', '.archive', filename), render(task))
      return filename
    }

    it('deletes specified files', () => {
      const f1 = writeArchivedTask({
        id: 'TEST-001',
        type: 'feat',
        status: 'done',
        created: '2026-01-15',
        title: 'delete me',
        description: '',
        acceptance_criteria: [],
      })

      executePrune(tmp, [f1])
      expect(existsSync(join(tmp, '.tasks', '.archive', f1))).toBe(false)
    })

    it('leaves other files untouched', () => {
      const f1 = writeArchivedTask({
        id: 'TEST-001',
        type: 'feat',
        status: 'done',
        created: '2026-01-15',
        title: 'delete me',
        description: '',
        acceptance_criteria: [],
      })
      const f2 = writeArchivedTask({
        id: 'TEST-002',
        type: 'fix',
        status: 'done',
        created: '2026-03-01',
        title: 'keep me',
        description: '',
        acceptance_criteria: [],
      })

      executePrune(tmp, [f1])
      expect(existsSync(join(tmp, '.tasks', '.archive', f1))).toBe(false)
      expect(existsSync(join(tmp, '.tasks', '.archive', f2))).toBe(true)
    })
  })
})
