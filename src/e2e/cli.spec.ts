import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFile } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
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
  mkdirSync(join(dir, '.config', 'mrkl'), { recursive: true })
  writeFileSync(
    join(dir, '.config', 'mrkl', 'mrkl.toml'),
    'prefix = "TEST"\ntasks_dir = ".tasks"\nverbose_files = false\n',
  )
  writeFileSync(join(dir, '.config', 'mrkl', 'mrkl_counter'), '0')
  return dir
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
    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    expect(existsSync(taskPath)).toBe(true)
    const data = parseTaskFile(taskPath)
    expect(data.id).toBe('TEST-001')
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
    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    const content = readFileSync(taskPath, 'utf-8')
    expect(content).toContain('Fix the login')
    expect(content).toContain('Login works')
  })

  it('increments counter for subsequent creates', async () => {
    await runCli(['create', 'feat', 'First task'], dir)
    await runCli(['create', 'feat', 'Second task'], dir)

    expect(existsSync(join(dir, '.tasks', 'TEST-001.md'))).toBe(true)
    expect(existsSync(join(dir, '.tasks', 'TEST-002.md'))).toBe(true)
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

  it('resolves numeric shorthand IDs', async () => {
    seedTaskFile(dir, 'TEST-002', 'Another task', 'fix')
    writeFileSync(join(dir, '.config', 'mrkl', 'mrkl_counter'), '2')

    const result = await runCli(['done', '2'], dir)

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
    tui.write('\x1b[B') // down to title
    await new Promise((r) => setTimeout(r, 200))
    tui.write('My interactive task')
    await tui.waitForContent('My interactive task')
    // Enter through: title → desc → parent → blocks +Add → criteria +Add (empty = submit)
    for (let i = 0; i < 4; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    const code = await tui.exitCode
    expect(code).toBe(0)

    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    expect(existsSync(taskPath)).toBe(true)
    const data = parseTaskFile(taskPath)
    expect(data.id).toBe('TEST-001')
    expect(data.type).toBe('feat')
    expect(data.title).toBe('my interactive task')
    expect(data.status).toBe('todo')
  })

  it('task file frontmatter matches typed title and selected type', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('feat')
    tui.write('\x1b[C') // right → cycle type to fix
    await tui.waitForContent('fix')
    tui.write('\x1b[B') // down to title
    await new Promise((r) => setTimeout(r, 200))
    tui.write('Bug fix title')
    await tui.waitForContent('Bug fix title')
    for (let i = 0; i < 4; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    const code = await tui.exitCode
    expect(code).toBe(0)

    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    const data = parseTaskFile(taskPath)
    expect(data.type).toBe('fix')
    expect(data.title).toBe('bug fix title')
  })

  it('final screen state is snapshotted', async () => {
    tui = spawnTui('create', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('feat')
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('My interactive task')
    await tui.waitForContent('My interactive task')
    for (let i = 0; i < 4; i++) {
      tui.write('\r')
      await new Promise((r) => setTimeout(r, 100))
    }
    await tui.exitCode
    const screen = tui.readScreen()
    expect(screen).toMatchSnapshot()
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
    await tui.waitForContent('Original title')

    const screen = tui.readScreen()
    expect(screen).toContain('Edit Task')
    expect(screen).toContain('Original title')
    expect(screen).toMatchSnapshot()
  })

  it('modifying and submitting edit updates task file', { timeout: 15000 }, async () => {
    seedTaskFile(dir, 'TEST-001', 'Original title', 'feat')

    tui = spawnTui('list', { cols: 80, rows: 24, cwd: dir })
    await tui.waitForContent('TEST-001')
    tui.write('\r')
    await tui.waitForContent('Edit Task', 8000)
    await new Promise((r) => setTimeout(r, 300))

    // Navigate: type(0) → status(1) → title(2)
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 200))
    tui.write('\x1b[B')
    await new Promise((r) => setTimeout(r, 300))

    // Append to existing title
    tui.write(' updated')
    await tui.waitForContent('Original title updated', 8000)

    // Use ↓ to skip past autocomplete fields (Parent, +Block) which would
    // select suggestions on Enter, then Enter on +Add (text field) to submit
    // title → desc → parent → +Block → +Add
    for (let i = 0; i < 4; i++) {
      tui.write('\x1b[B')
      await new Promise((r) => setTimeout(r, 150))
    }
    // Enter on +Add (empty) triggers submit
    tui.write('\r')

    const code = await tui.exitCode
    expect(code).toBe(0)

    const taskPath = join(dir, '.tasks', 'TEST-001.md')
    const data = parseTaskFile(taskPath)
    expect(data.title).toBe('original title updated')
  })
})
