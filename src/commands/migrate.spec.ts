import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
  readdirSync,
  renameSync,
} from 'node:fs'
import { join, basename } from 'node:path'
import { tmpdir } from 'node:os'

import matter from 'gray-matter'
import { TASKS_DIR } from '../id.js'
import { render } from '../template.js'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'mrkl-migrate-'))
  mkdirSync(join(tmp, TASKS_DIR, '.archive'), { recursive: true })
})

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

function writeVerboseFile(
  dir: string,
  filename: string,
  frontmatter: Record<string, unknown>,
  body: string,
) {
  const content = matter.stringify(body, frontmatter)
  writeFileSync(join(dir, filename), content)
}

// Replicate migrateDir logic inline since it's not exported
function runMigrate(dir: string) {
  const tasksDir = join(dir, TASKS_DIR)
  const archiveDir = join(tasksDir, '.archive')
  const VERBOSE_REGEX = /^(\S+)\s+(\S+)\s+-\s+(.+)$/

  for (const dirPath of [tasksDir, archiveDir]) {
    let files: string[]
    try {
      files = readdirSync(dirPath).filter(
        (f) => f.endsWith('.md') && !f.startsWith('.'),
      )
    } catch {
      continue
    }

    for (const file of files) {
      const filePath = join(dirPath, file)
      const raw = readFileSync(filePath, 'utf-8')
      const { data, content: bodyContent } = matter(raw)

      if (data.title) continue

      const stem = basename(file, '.md')
      const match = stem.match(VERBOSE_REGEX)
      if (!match) continue

      const title = match[3]
      const descMatch = bodyContent.match(
        /## Description\n\n([\s\S]*?)(?:\n\n## Acceptance Criteria|$)/,
      )
      const description = descMatch ? descMatch[1].trim() : ''
      const acRegex = /^- \[[ x]\] (.+)$/gm
      const acceptance_criteria: string[] = []
      let acMatch
      while ((acMatch = acRegex.exec(bodyContent)) !== null) {
        acceptance_criteria.push(acMatch[1])
      }

      const task = {
        id: data.id as string,
        title,
        type: data.type as string,
        status: data.status as string,
        created:
          data.created instanceof Date
            ? data.created.toISOString().slice(0, 10)
            : String(data.created),
        description,
        acceptance_criteria,
      }

      writeFileSync(filePath, render(task as Parameters<typeof render>[0]))

      const newName = `${data.id as string}.md`
      if (file !== newName) {
        renameSync(filePath, join(dirPath, newName))
      }
    }
  }
}

describe('migrate', () => {
  it('adds title to frontmatter from verbose filename and renames to non-verbose', () => {
    const tasksDir = join(tmp, TASKS_DIR)
    writeVerboseFile(
      tasksDir,
      'TEST-001 feat - add login.md',
      {
        id: 'TEST-001',
        type: 'feat',
        status: 'todo',
        created: '2026-03-01',
      },
      '\n## Description\n\nSome desc.\n\n## Acceptance Criteria\n\n- [ ] it works\n',
    )

    runMigrate(tmp)

    const newPath = join(tasksDir, 'TEST-001.md')
    expect(existsSync(newPath)).toBe(true)
    expect(existsSync(join(tasksDir, 'TEST-001 feat - add login.md'))).toBe(false)
    const content = readFileSync(newPath, 'utf-8')
    const { data } = matter(content)
    expect(data.title).toBe('add login')
  })

  it('skips files that already have title in frontmatter', () => {
    const tasksDir = join(tmp, TASKS_DIR)
    writeVerboseFile(
      tasksDir,
      'TEST-001.md',
      {
        id: 'TEST-001',
        title: 'already has title',
        type: 'feat',
        status: 'todo',
        created: '2026-03-01',
      },
      '\n## Description\n\n\n\n## Acceptance Criteria\n\n',
    )

    runMigrate(tmp)

    expect(existsSync(join(tasksDir, 'TEST-001.md'))).toBe(true)
    const content = readFileSync(join(tasksDir, 'TEST-001.md'), 'utf-8')
    const { data } = matter(content)
    expect(data.title).toBe('already has title')
  })

  it('handles both active and archived tasks', () => {
    const tasksDir = join(tmp, TASKS_DIR)
    const archiveDir = join(tasksDir, '.archive')

    writeVerboseFile(
      tasksDir,
      'TEST-001 feat - active task.md',
      {
        id: 'TEST-001',
        type: 'feat',
        status: 'todo',
        created: '2026-03-01',
      },
      '\n## Description\n\n\n\n## Acceptance Criteria\n\n',
    )

    writeVerboseFile(
      archiveDir,
      'TEST-002 fix - archived task.md',
      {
        id: 'TEST-002',
        type: 'fix',
        status: 'done',
        created: '2026-02-01',
      },
      '\n## Description\n\n\n\n## Acceptance Criteria\n\n',
    )

    runMigrate(tmp)

    expect(existsSync(join(tasksDir, 'TEST-001.md'))).toBe(true)
    expect(existsSync(join(archiveDir, 'TEST-002.md'))).toBe(true)

    const active = matter(readFileSync(join(tasksDir, 'TEST-001.md'), 'utf-8'))
    expect(active.data.title).toBe('active task')

    const archived = matter(readFileSync(join(archiveDir, 'TEST-002.md'), 'utf-8'))
    expect(archived.data.title).toBe('archived task')
  })

  it('skips files where title cannot be extracted from non-verbose filename', () => {
    const tasksDir = join(tmp, TASKS_DIR)
    writeVerboseFile(
      tasksDir,
      'TEST-001.md',
      {
        id: 'TEST-001',
        type: 'feat',
        status: 'todo',
        created: '2026-03-01',
      },
      '\n## Description\n\n\n\n## Acceptance Criteria\n\n',
    )

    runMigrate(tmp)

    expect(existsSync(join(tasksDir, 'TEST-001.md'))).toBe(true)
    const content = readFileSync(join(tasksDir, 'TEST-001.md'), 'utf-8')
    const { data } = matter(content)
    expect(data.title).toBeUndefined()
  })
})
