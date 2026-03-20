import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFile } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { spawnTui, type TuiProcess } from '../tui/tui-test-harness.js'

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../../..')
const TSX_BIN = resolve(PROJECT_ROOT, 'node_modules/.bin/tsx')
const CLI_PATH = resolve(PROJECT_ROOT, 'src/cli.ts')

interface CliResult {
  stdout: string
  stderr: string
  exitCode: number
}

function runCli(args: string[], cwd: string): Promise<CliResult> {
  return new Promise((res) => {
    execFile(
      TSX_BIN,
      [CLI_PATH, ...args],
      { cwd, env: { ...process.env, NO_COLOR: '1' } },
      (error, stdout, stderr) => {
        res({
          stdout: stdout?.toString() ?? '',
          stderr: stderr?.toString() ?? '',
          exitCode: error ? (error as NodeJS.ErrnoException & { code?: number }).code ?? 1 : 0,
        })
      },
    )
  })
}

function setupTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mrkl-e2e-'))
  mkdirSync(join(dir, '.tasks', '.archive'), { recursive: true })
  return dir
}

function findCreatedTaskFile(dir: string): { path: string; data: Record<string, unknown> } {
  const files = readdirSync(join(dir, '.tasks')).filter(
    (f) => f.endsWith('.md') && !f.startsWith('.'),
  )
  if (files.length === 0) throw new Error('No task files found')
  const filePath = join(dir, '.tasks', files[files.length - 1])
  return { path: filePath, data: parseTaskFile(filePath) }
}

function seedTaskFile(dir: string, id: string, title: string, type: string, status = 'todo'): void {
  writeFileSync(
    join(dir, '.tasks', `${id}.md`),
    `---\nid: ${id}\ntitle: ${title}\ntype: ${type}\nstatus: ${status}\ncreated: '2026-01-01'\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
  )
}

function parseTaskFile(filePath: string): Record<string, unknown> {
  const content = readFileSync(filePath, 'utf-8')
  return matter(content).data
}

describe('cli e2e — create command', () => {
  let dir: string

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('creates a task file with correct frontmatter', async () => {
    const result = await runCli(['create', 'feat', 'My new feature'], dir)

    expect(result.exitCode).toBe(0)
    const { data } = findCreatedTaskFile(dir)
    expect(data.id).toMatch(/^[0-9a-z]{3,}-[0-9a-z]{6}$/)
    expect(data.type).toBe('feat')
    expect(data.title).toBe('my new feature')
    expect(data.status).toBe('todo')
  })

  it('creates task with description and acceptance criteria', async () => {
    const result = await runCli(
      ['create', 'fix', 'Bug fix', '--desc', 'Fix the login', '--ac', 'Login works'],
      dir,
    )

    expect(result.exitCode).toBe(0)
    const { path: taskPath } = findCreatedTaskFile(dir)
    const content = readFileSync(taskPath, 'utf-8')
    expect(content).toContain('Fix the login')
    expect(content).toContain('Login works')
  })

  it('creates task with --flag', async () => {
    const result = await runCli(
      ['create', 'feat', 'Flagged task', '--flag', 'needs-review'],
      dir,
    )

    expect(result.exitCode).toBe(0)
    const { data } = findCreatedTaskFile(dir)
    expect(data.flag).toBe('needs-review')
  })

  it('generates unique temporal IDs for subsequent creates', async () => {
    await runCli(['create', 'feat', 'First task'], dir)
    await new Promise((r) => setTimeout(r, 10))
    await runCli(['create', 'feat', 'Second task'], dir)

    const files = readdirSync(join(dir, '.tasks')).filter(
      (f) => f.endsWith('.md') && !f.startsWith('.'),
    )
    expect(files).toHaveLength(2)
  })

  it('errors when only type is provided (missing title)', async () => {
    const result = await runCli(['create', 'feat'], dir)

    expect(result.exitCode).not.toBe(0)
  })
})

describe('cli e2e — done command', () => {
  let dir: string

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('marks task as done and moves to archive', async () => {
    seedTaskFile(dir, 'TEST-001', 'Some task', 'feat')
    const result = await runCli(['done', 'TEST-001'], dir)

    expect(result.exitCode).toBe(0)
    expect(existsSync(join(dir, '.tasks', 'TEST-001.md'))).toBe(false)
    const archivePath = join(dir, '.tasks', '.archive', 'TEST-001.md')
    expect(existsSync(archivePath)).toBe(true)
    const data = parseTaskFile(archivePath)
    expect(data.status).toBe('done')
  })

  it('resolves task by prefix match', async () => {
    seedTaskFile(dir, 'TEST-002', 'Another task', 'fix')

    const result = await runCli(['done', 'TEST-002'], dir)

    expect(result.exitCode).toBe(0)
    expect(existsSync(join(dir, '.tasks', '.archive', 'TEST-002.md'))).toBe(true)
  })

  it('errors on non-existent task', async () => {
    const result = await runCli(['done', 'TEST-999'], dir)

    expect(result.exitCode).not.toBe(0)
  })
})

describe('cli e2e — close command', () => {
  let dir: string

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('closes task and moves to archive', async () => {
    seedTaskFile(dir, 'TEST-003', 'Task to close', 'chore')

    const result = await runCli(['close', 'TEST-003'], dir)

    expect(result.exitCode).toBe(0)
    expect(existsSync(join(dir, '.tasks', 'TEST-003.md'))).toBe(false)
    const archivePath = join(dir, '.tasks', '.archive', 'TEST-003.md')
    expect(existsSync(archivePath)).toBe(true)
    const data = parseTaskFile(archivePath)
    expect(data.status).toBe('closed')
  })

  it('closes with reason flag', async () => {
    seedTaskFile(dir, 'TEST-004', 'Duplicate task', 'feat')

    const result = await runCli(['close', 'TEST-004', '--reason', 'duplicate'], dir)

    expect(result.exitCode).toBe(0)
    const archivePath = join(dir, '.tasks', '.archive', 'TEST-004.md')
    const data = parseTaskFile(archivePath)
    expect(data.status).toBe('closed')
    expect(data.flag).toBe('duplicate')
  })

  it('errors on non-existent task', async () => {
    const result = await runCli(['done', 'TEST-999'], dir)

    expect(result.exitCode).not.toBe(0)
  })
})

describe('cli e2e — interactive create flow', () => {
  let dir: string
  let tui: TuiProcess | null = null

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    tui?.kill()
    tui = null
    rmSync(dir, { recursive: true, force: true })
  })

  it('interactive create flow produces correct task file', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('feat')
    tui.write('\x1b[B\x1b[B') // down to priority, then title
    await new Promise((r) => setTimeout(r, 200))
    tui.write('My interactive task')
    await tui.waitForContent('My interactive task')
    // Enter through: title → desc → flag → parent → +Block → +Add (empty = submit)
    for (let i = 0; i < 6; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    const code = await tui.exitCode
    expect(code).toBe(0)

    const { data } = findCreatedTaskFile(dir)
    expect(data.id).toMatch(/^[0-9a-z]{3,}-[0-9a-z]{6}$/)
    expect(data.type).toBe('feat')
    expect(data.title).toBe('my interactive task')
    expect(data.status).toBe('todo')
  })

  it('task file frontmatter matches typed title and selected type', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('feat')
    tui.write('\x1b[C') // right → cycle type to fix
    await tui.waitForContent('fix')
    tui.write('\x1b[B\x1b[B') // down to priority, then title
    await new Promise((r) => setTimeout(r, 200))
    tui.write('Bug fix title')
    await tui.waitForContent('Bug fix title')
    for (let i = 0; i < 6; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    const code = await tui.exitCode
    expect(code).toBe(0)

    const { data } = findCreatedTaskFile(dir)
    expect(data.type).toBe('fix')
    expect(data.title).toBe('bug fix title')
  })

  it('final screen state is snapshotted', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('feat')
    tui.write('\x1b[B\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('My interactive task')
    await tui.waitForContent('My interactive task')
    for (let i = 0; i < 6; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    await tui.exitCode
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
  })
})

describe('cli e2e — plain list with --sortby', () => {
  let dir: string
  let tui: TuiProcess | null = null

  beforeEach(() => {
    dir = setupTempDir()
    writeFileSync(
      join(dir, '.tasks', 'TEST-001.md'),
      `---\nid: TEST-001\ntitle: low priority task\ntype: feat\nstatus: todo\npriority: 1\ncreated: '2026-01-03'\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
    )
    writeFileSync(
      join(dir, '.tasks', 'TEST-002.md'),
      `---\nid: TEST-002\ntitle: high priority task\ntype: fix\nstatus: done\npriority: 5\ncreated: '2026-01-01'\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
    )
    writeFileSync(
      join(dir, '.tasks', 'TEST-003.md'),
      `---\nid: TEST-003\ntitle: mid priority task\ntype: chore\nstatus: in-progress\npriority: 3\ncreated: '2026-01-02'\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
    )
  })

  afterEach(() => {
    tui?.kill()
    tui = null
    rmSync(dir, { recursive: true, force: true })
  })

  it('--sortby priority:desc outputs tasks sorted by priority descending', async () => {
    tui = spawnTui('list --plain --sortby priority:desc', { cols: 80, rows: 24, cwd: dir })
    const screen = await tui.waitForContent('TEST-001')
    const lines = screen.split('\n').filter((l) => l.includes('TEST-'))
    expect(lines[0]).toContain('TEST-002')
    expect(lines[1]).toContain('TEST-003')
    expect(lines[2]).toContain('TEST-001')
  })

  it('--sortby priority:asc outputs tasks sorted by priority ascending', async () => {
    tui = spawnTui('list --plain --sortby priority:asc', { cols: 80, rows: 24, cwd: dir })
    const screen = await tui.waitForContent('TEST-001')
    const lines = screen.split('\n').filter((l) => l.includes('TEST-'))
    expect(lines[0]).toContain('TEST-001')
    expect(lines[1]).toContain('TEST-003')
    expect(lines[2]).toContain('TEST-002')
  })

  it('--sortby defaults direction to desc when omitted', async () => {
    tui = spawnTui('list --plain --sortby status', { cols: 80, rows: 24, cwd: dir })
    const screen = await tui.waitForContent('TEST-001')
    const lines = screen.split('\n').filter((l) => l.includes('TEST-'))
    expect(lines[0]).toContain('TEST-002')
    expect(lines[1]).toContain('TEST-003')
    expect(lines[2]).toContain('TEST-001')
  })

  it('sorted output is flat without tree prefixes', async () => {
    tui = spawnTui('list --plain --sortby priority:desc', { cols: 80, rows: 24, cwd: dir })
    const screen = await tui.waitForContent('TEST-001')
    expect(screen).not.toContain('├')
    expect(screen).not.toContain('└')
  })
})

describe('cli e2e — interactive list flow', () => {
  let dir: string
  let tui: TuiProcess | null = null

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    tui?.kill()
    tui = null
    rmSync(dir, { recursive: true, force: true })
  })

  it('list renders pre-seeded tasks', async () => {
    seedTaskFile(dir, 'TEST-001', 'First seeded task', 'feat')
    seedTaskFile(dir, 'TEST-002', 'Second seeded task', 'fix')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-001')
    await tui.waitForContent('TEST-002')
    await tui.waitForContent('2/2 tasks')

    const screen = tui.readScreen()
    expect(screen).toContain('TEST-001')
    expect(screen).toContain('TEST-002')
    expect(screen).toMatchSnapshot()
  })

  it('selecting a task in list opens edit TUI', async () => {
    seedTaskFile(dir, 'TEST-001', 'Task to select', 'feat')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-001')
    tui.write('\r')
    await tui.waitForContent('Edit Task')

    const screen = tui.readScreen()
    expect(screen).toContain('Edit Task')
  })
})

describe('cli e2e — interactive edit flow', () => {
  let dir: string
  let tui: TuiProcess | null = null

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    tui?.kill()
    tui = null
    rmSync(dir, { recursive: true, force: true })
  })

  it('edit shows pre-populated form with task data', async () => {
    seedTaskFile(dir, 'TEST-001', 'Original title', 'feat')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-001')
    tui.write('\r')
    await tui.waitForContent('Edit Task')
    await tui.waitForContent('original title')

    const screen = tui.readScreen()
    expect(screen).toContain('Edit Task')
    expect(screen).toContain('original title')
    expect(screen).toMatchSnapshot()
  })

  it('modifying and submitting edit updates task file', { timeout: 15000 }, async () => {
    seedTaskFile(dir, 'TEST-001', 'Original title', 'feat')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-001')
    tui.write('\r')
    await tui.waitForContent('Edit Task', 8000)
    await new Promise((r) => setTimeout(r, 300))

    // Navigate: type(0) → status(1) → priority(2) → title(3)
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 300))

    // Append to existing title
    tui.write(' updated')
    await tui.waitForContent('original title updated', 8000)

    // Enter through: title → desc → flag → parent → +Block → +Add (empty = submit)
    for (let i = 0; i < 6; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 150))
    }

    // After edit, list view re-appears — press Esc to exit
    await tui.waitForContent('TEST-001', 8000)
    tui.write('\x1b')

    const code = await tui.exitCode
    expect(code).toBe(0)

    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    const data = parseTaskFile(taskPath)
    expect(data.title).toBe('original title updated')
  })

  it('setting parent via TUI edit persists to task file', { timeout: 15000 }, async () => {
    seedTaskFile(dir, 'TEST-001', 'epic task', 'feat')
    seedTaskFile(dir, 'TEST-002', 'child task', 'feat')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-002')
    // Select TEST-002 (arrow down then Enter to open edit)
    tui.write('\x1b[B') // highlight TEST-002
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\r')
    await tui.waitForContent('Edit Task', 8000)
    await new Promise((r) => setTimeout(r, 300))

    // Navigate: type(0) → status(1) → priority(2) → title(3) → desc(4) → flag(5) → parent(6)
    for (let i = 0; i < 6; i++) {
      tui.write('\x1b[B')
      await new Promise((r) => setTimeout(r, 150))
    }
    await new Promise((r) => setTimeout(r, 200))

    // Type parent ID to filter autocomplete
    tui.write('epic')
    await tui.waitForContent('epic task')
    // Enter to select highlighted suggestion
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))

    // Now on +Block field — Enter advances to +Add criteria
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))
    // +Add criteria — Enter with empty input submits
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))

    // After edit, list view re-appears — press Esc to exit
    await tui.waitForContent('TEST-002', 8000)
    tui.write('\x1b')

    const code = await tui.exitCode
    expect(code).toBe(0)

    const data = parseTaskFile(join(dir, '.tasks', 'TEST-002.md'))
    expect(data.parent).toBe('TEST-001')
  })

  it('existing parent survives TUI edit of other fields', { timeout: 15000 }, async () => {
    seedTaskFile(dir, 'TEST-001', 'epic task', 'feat')
    // Seed child with parent already set
    writeFileSync(
      join(dir, '.tasks', 'TEST-002.md'),
      `---\nid: TEST-002\ntitle: child task\ntype: feat\nstatus: todo\ncreated: '2026-01-01'\nparent: TEST-001\nblocks:\n  - TEST-001\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
    )

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-002')
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\r')
    await tui.waitForContent('Edit Task', 8000)
    await new Promise((r) => setTimeout(r, 300))

    // Navigate to title: type(0) → status(1) → priority(2) → title(3)
    for (let i = 0; i < 3; i++) {
      tui.write('\x1b[B')
      await new Promise((r) => setTimeout(r, 150))
    }
    await new Promise((r) => setTimeout(r, 200))

    // Append to title
    tui.write(' updated')
    await tui.waitForContent('child task updated')

    // Enter through: title → desc → flag → parent → block entry → +Block → +Add (empty = submit)
    for (let i = 0; i < 7; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 200))
    }

    await tui.waitForContent('TEST-002', 8000)
    tui.write('\x1b')

    const code = await tui.exitCode
    expect(code).toBe(0)

    const data = parseTaskFile(join(dir, '.tasks', 'TEST-002.md'))
    expect(data.title).toBe('child task updated')
    expect(data.parent).toBe('TEST-001')
    expect(data.blocks).toEqual(['TEST-001'])
  })

  it('clearing parent via TUI edit removes it from task file', { timeout: 15000 }, async () => {
    seedTaskFile(dir, 'TEST-001', 'epic task', 'feat')
    // Seed child with parent already set
    writeFileSync(
      join(dir, '.tasks', 'TEST-002.md'),
      `---\nid: TEST-002\ntitle: child task\ntype: feat\nstatus: todo\ncreated: '2026-01-01'\nparent: TEST-001\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`,
    )

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-002')
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\r')
    await tui.waitForContent('Edit Task', 8000)
    await new Promise((r) => setTimeout(r, 300))

    // Navigate to parent: type(0) → status(1) → priority(2) → title(3) → desc(4) → flag(5) → parent(6)
    for (let i = 0; i < 6; i++) {
      tui.write('\x1b[B')
      await new Promise((r) => setTimeout(r, 150))
    }
    await new Promise((r) => setTimeout(r, 200))

    // Clear the parent field — backspace enough to clear the label
    for (let i = 0; i < 30; i++) {
      tui.write('\x7f')
    }
    await new Promise((r) => setTimeout(r, 200))

    // Enter on empty parent → clears it
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))

    // +Block field — Enter advances to +Add criteria
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))
    // +Add criteria — Enter with empty input submits
    tui.write('\r')
    await new Promise((r) => setTimeout(r, 200))

    await tui.waitForContent('TEST-002', 8000)
    tui.write('\x1b')

    const code = await tui.exitCode
    expect(code).toBe(0)

    const data = parseTaskFile(join(dir, '.tasks', 'TEST-002.md'))
    expect(data.title).toBe('child task')
    expect(data.parent).toBeUndefined()
  })
})

describe('cli e2e — edit command (non-interactive)', () => {
  let dir: string

  beforeEach(() => {
    dir = setupTempDir()
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('updates title via --title flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'original', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--title', 'updated title'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-001.md'))
    expect(data.title).toBe('updated title')
    expect(data.type).toBe('feat')
  })

  it('updates type via --type flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'some task', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--type', 'fix'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-001.md'))
    expect(data.type).toBe('fix')
    expect(data.title).toBe('some task')
  })

  it('updates description via --desc flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'task', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--desc', 'new description'], dir)

    expect(result.exitCode).toBe(0)
    const content = readFileSync(join(dir, '.tasks', 'TEST-001.md'), 'utf-8')
    expect(content).toContain('new description')
  })

  it('updates acceptance criteria via --ac flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'task', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--ac', 'criterion one', '--ac', 'criterion two'], dir)

    expect(result.exitCode).toBe(0)
    const content = readFileSync(join(dir, '.tasks', 'TEST-001.md'), 'utf-8')
    expect(content).toContain('- [ ] criterion one')
    expect(content).toContain('- [ ] criterion two')
  })

  it('updates multiple fields at once', async () => {
    seedTaskFile(dir, 'TEST-001', 'original', 'feat')

    const result = await runCli([
      'edit', 'TEST-001',
      '--title', 'new name',
      '--type', 'fix',
      '--desc', 'fixed description',
    ], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-001.md'))
    expect(data.title).toBe('new name')
    expect(data.type).toBe('fix')
    const content = readFileSync(join(dir, '.tasks', 'TEST-001.md'), 'utf-8')
    expect(content).toContain('fixed description')
  })

  it('updates parent via --parent flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'epic', 'feat')
    seedTaskFile(dir, 'TEST-002', 'child', 'feat')

    const result = await runCli(['edit', 'TEST-002', '--parent', 'TEST-001'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-002.md'))
    expect(data.parent).toBe('TEST-001')
  })

  it('updates blocks via --blocks flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'blocked', 'feat')
    seedTaskFile(dir, 'TEST-002', 'blocker', 'feat')

    const result = await runCli(['edit', 'TEST-002', '--blocks', 'TEST-001'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-002.md'))
    expect(data.blocks).toContain('TEST-001')
  })

  it('updates flag via --flag', async () => {
    seedTaskFile(dir, 'TEST-001', 'some task', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--flag', 'blocked'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-001.md'))
    expect(data.flag).toBe('blocked')
  })

  it('updates priority via --priority', async () => {
    seedTaskFile(dir, 'TEST-001', 'some task', 'feat')

    const result = await runCli(['edit', 'TEST-001', '--priority', '5'], dir)

    expect(result.exitCode).toBe(0)
    const data = parseTaskFile(join(dir, '.tasks', 'TEST-001.md'))
    expect(data.priority).toBe(5)
  })
})
