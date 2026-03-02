import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadConfig } from './config.js'
import { nextId } from './counter.js'
import { render, parse } from './template.js'
import type { CreateTaskOpts, ListFilter, PruneResult, TaskData } from './types.js'

export function normalizeTitle(raw: string): string {
  const result = raw
    .trim()
    .toLowerCase()
    .replace(/[/\\]/g, '-')
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/ {2,}/g, ' ')
    .replace(/^-+|-+$/g, '')

  if (!result) throw new Error('Title is empty after normalisation')
  return result
}

export function createTask(opts: CreateTaskOpts): TaskData {
  const config = loadConfig(opts.dir)
  const num = nextId(opts.dir)
  const id = `${config.prefix}-${String(num).padStart(3, '0')}`
  const today = new Date().toISOString().slice(0, 10)

  const task: TaskData = {
    id,
    type: opts.type,
    status: 'todo',
    created: today,
    title: normalizeTitle(opts.title),
    description: opts.description ?? '',
    acceptance_criteria: opts.acceptance_criteria ?? [],
  }

  const filename = `${id} ${task.type} - ${task.title}.md`
  const tasksDir = join(opts.dir, config.tasks_dir)
  writeFileSync(join(tasksDir, filename), render(task))

  return task
}

export function listTasks(filter: ListFilter): TaskData[] {
  const config = loadConfig(filter.dir)
  const tasksDir = join(filter.dir, config.tasks_dir)

  const files = readdirSync(tasksDir).filter((f) => f.endsWith('.md') && !f.startsWith('.'))

  let tasks = files.flatMap((f) => {
    try {
      const content = readFileSync(join(tasksDir, f), 'utf-8')
      const task = parse(content, f)
      if (!task.id || !task.type || !task.status) return []
      return [task]
    } catch {
      return []
    }
  })

  if (filter.type) tasks = tasks.filter((t) => t.type === filter.type)
  if (filter.status) tasks = tasks.filter((t) => t.status === filter.status)

  return tasks
}

export function archiveTask(dir: string, id: string): void {
  const config = loadConfig(dir)
  const tasksDir = join(dir, config.tasks_dir)

  const idUpper = id.toUpperCase()
  const file = readdirSync(tasksDir).find(
    (f) => f.endsWith('.md') && f.toUpperCase().startsWith(idUpper)
  )

  if (!file) {
    throw new Error(`Task ${id} not found`)
  }

  const filePath = join(tasksDir, file)
  const content = readFileSync(filePath, 'utf-8')
  const task = parse(content, file)
  task.status = 'done'

  const archivePath = join(tasksDir, '.archive', file)
  writeFileSync(archivePath, render(task))
  unlinkSync(filePath)
}

export function parseCutoffDate(input: string): string {
  const normalized = input.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`Invalid date format: "${input}". Expected YYYY-MM-DD or YYYYMMDD.`)
  }
  const [y, m, d] = normalized.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Invalid date: "${input}" is not a real calendar date.`)
  }
  return normalized
}

function normalizeCreatedDate(created: unknown): string {
  if (created instanceof Date) {
    return created.toISOString().slice(0, 10)
  }
  return String(created)
}

export function pruneTasks(dir: string, cutoff: string): PruneResult {
  const config = loadConfig(dir)
  const archiveDir = join(dir, config.tasks_dir, '.archive')

  if (!existsSync(archiveDir)) {
    return { deleted: [], total: 0 }
  }

  const files = readdirSync(archiveDir).filter((f) => f.endsWith('.md') && !f.startsWith('.'))

  const deleted: PruneResult['deleted'] = []

  for (const f of files) {
    try {
      const content = readFileSync(join(archiveDir, f), 'utf-8')
      const task = parse(content, f)
      const created = normalizeCreatedDate(task.created)
      if (created <= cutoff) {
        deleted.push({ id: task.id, title: task.title, created, filename: f })
      }
    } catch {
      // skip unparseable files
    }
  }

  return { deleted, total: files.length }
}

export function executePrune(dir: string, filenames: string[]): void {
  const config = loadConfig(dir)
  const archiveDir = join(dir, config.tasks_dir, '.archive')
  for (const f of filenames) {
    unlinkSync(join(archiveDir, f))
  }
}

export function closeTask(dir: string, id: string): void {
  const config = loadConfig(dir)
  const tasksDir = join(dir, config.tasks_dir)

  const idUpper = id.toUpperCase()
  const file = readdirSync(tasksDir).find(
    (f) => f.endsWith('.md') && f.toUpperCase().startsWith(idUpper)
  )

  if (!file) {
    throw new Error(`Task ${id} not found`)
  }

  const filePath = join(tasksDir, file)
  const content = readFileSync(filePath, 'utf-8')
  const task = parse(content, file)
  task.status = 'closed'

  const archivePath = join(tasksDir, '.archive', file)
  writeFileSync(archivePath, render(task))
  unlinkSync(filePath)
}
