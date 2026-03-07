import { defineCommand } from 'citty'
import consola from 'consola'
import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join, basename } from 'node:path'
import matter from 'gray-matter'
import { loadConfig } from '../config.js'
import { render } from '../template.js'
import type { TaskData, TaskType, Status } from '../types.js'

const VERBOSE_REGEX = /^(\S+)\s+(\S+)\s+-\s+(.+)$/

function migrateDir(
  dirPath: string,
  verboseFiles: boolean,
): { migrated: number; skipped: number; warnings: string[] } {
  let migrated = 0
  let skipped = 0
  const warnings: string[] = []

  let files: string[]
  try {
    files = readdirSync(dirPath).filter(
      (f) => f.endsWith('.md') && !f.startsWith('.'),
    )
  } catch {
    return { migrated, skipped, warnings }
  }

  for (const file of files) {
    const filePath = join(dirPath, file)
    const raw = readFileSync(filePath, 'utf-8')
    const { data, content: body } = matter(raw)

    if (data.title) {
      skipped++
      continue
    }

    const stem = basename(file, '.md')
    const match = stem.match(VERBOSE_REGEX)
    if (!match) {
      warnings.push(`Could not extract title from filename: ${file}`)
      skipped++
      continue
    }

    const title = match[3]

    const task: TaskData = {
      id: data.id as string,
      type: data.type as TaskType,
      status: data.status as Status,
      created:
        data.created instanceof Date
          ? data.created.toISOString().slice(0, 10)
          : String(data.created),
      title,
      description: '',
      acceptance_criteria: [],
    }

    // Extract description
    const descMatch = body.match(
      /## Description\n\n([\s\S]*?)(?:\n\n## Acceptance Criteria|$)/,
    )
    task.description = descMatch ? descMatch[1].trim() : ''

    // Extract acceptance criteria
    const acRegex = /^- \[[ x]\] (.+)$/gm
    let acMatch
    while ((acMatch = acRegex.exec(body)) !== null) {
      task.acceptance_criteria.push(acMatch[1])
    }

    writeFileSync(filePath, render(task))

    if (!verboseFiles) {
      const newName = `${data.id as string}.md`
      if (file !== newName) {
        renameSync(filePath, join(dirPath, newName))
      }
    }

    migrated++
  }

  return { migrated, skipped, warnings }
}

export default defineCommand({
  meta: {
    name: 'migrate',
    description: 'Migrate task files to include title in frontmatter',
  },
  run() {
    const dir = process.cwd()
    try {
      const config = loadConfig(dir)
      const tasksDir = join(dir, config.tasks_dir)
      const archiveDir = join(tasksDir, '.archive')

      const active = migrateDir(tasksDir, config.verbose_files)
      const archived = migrateDir(archiveDir, config.verbose_files)

      const totalMigrated = active.migrated + archived.migrated
      const totalSkipped = active.skipped + archived.skipped
      const allWarnings = [...active.warnings, ...archived.warnings]

      consola.success(
        `Migrated ${totalMigrated} file(s), skipped ${totalSkipped} file(s).`,
      )
      for (const w of allWarnings) {
        consola.warn(w)
      }

      if (totalMigrated > 0) {
        consola.info(
          'Breaking change: title is now stored in frontmatter. Old parsers may need updating.',
        )
      }
    } catch (err) {
      consola.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
