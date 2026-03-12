import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFile } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

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
