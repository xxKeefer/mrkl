import {
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import { loadConfig } from './config.js'
import { EMOJI } from './emoji.js'
import { nextId } from './counter.js'
import { render, parse } from './template.js'
import type {
  CreateTaskOpts,
  EditTaskResult,
  GroupedTask,
  ListFilter,
  PatchTaskOpts,
  PruneResult,
  Status,
  TaskData,
} from './types.js'

export function normalizeTitle(raw: string): string {
  const result = raw
    .trim()
    .toLowerCase()
    .replace(/[/\\]/g, '-')
    // eslint-disable-next-line no-control-regex
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

  const resolvedParent = opts.parent
    ? resolveTaskId(opts.dir, opts.parent)
    : undefined
  const resolvedBlocks = opts.blocks?.map((b) => resolveTaskId(opts.dir, b))

  if (resolvedParent || resolvedBlocks?.length) {
    const activeTasks = listTasks({ dir: opts.dir })

    if (resolvedParent) {
      const result = validateParent(activeTasks, resolvedParent)
      if (!result.valid) throw new Error(result.reason)
    }

    if (resolvedBlocks?.length) {
      const result = validateBlocks(activeTasks, resolvedBlocks)
      if (!result.valid) throw new Error(result.reason)
    }
  }

  const task: TaskData = {
    id,
    type: opts.type,
    status: 'todo',
    created: today,
    title: normalizeTitle(opts.title),
    description: opts.description ?? '',
    acceptance_criteria: opts.acceptance_criteria ?? [],
    priority: opts.priority ?? 3,
    ...(opts.flag && { flag: opts.flag }),
    ...(resolvedParent && { parent: resolvedParent }),
    ...(resolvedBlocks?.length && { blocks: resolvedBlocks }),
  }

  const filename = config.verbose_files
    ? `${id} ${task.type} - ${task.title}.md`
    : `${id}.md`
  const tasksDir = join(opts.dir, config.tasks_dir)
  writeFileSync(join(tasksDir, filename), render(task))

  return task
}

export function listTasks(filter: ListFilter): TaskData[] {
  const config = loadConfig(filter.dir)
  const tasksDir = join(filter.dir, config.tasks_dir)

  const files = readdirSync(tasksDir).filter(
    (f) => f.endsWith('.md') && !f.startsWith('.'),
  )

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

  if (filter.type) {
    const types = filter.type.split(',')
    tasks = tasks.filter((t) => types.includes(t.type))
  }
  if (filter.status) {
    const statuses = filter.status.split(',')
    tasks = tasks.filter((t) => statuses.includes(t.status))
  }
  if (filter.search) {
    const q = filter.search.toLowerCase()
    tasks = tasks.filter((t) =>
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q),
    )
  }

  return tasks
}

export function parseCutoffDate(input: string): string {
  const normalized = input.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(
      `Invalid date format: "${input}". Expected YYYY-MM-DD or YYYYMMDD.`,
    )
  }
  const [y, m, d] = normalized.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
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

  const files = readdirSync(archiveDir).filter(
    (f) => f.endsWith('.md') && !f.startsWith('.'),
  )

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

export function listArchivedTasks(filter: ListFilter): TaskData[] {
  const config = loadConfig(filter.dir)
  const archiveDir = join(filter.dir, config.tasks_dir, '.archive')

  if (!existsSync(archiveDir)) return []

  const files = readdirSync(archiveDir).filter(
    (f) => f.endsWith('.md') && !f.startsWith('.'),
  )

  let tasks = files.flatMap((f) => {
    try {
      const content = readFileSync(join(archiveDir, f), 'utf-8')
      const task = parse(content, f)
      if (!task.id || !task.type || !task.status) return []
      return [task]
    } catch {
      return []
    }
  })

  if (filter.type) {
    const types = filter.type.split(',')
    tasks = tasks.filter((t) => types.includes(t.type))
  }
  if (filter.status) {
    const statuses = filter.status.split(',')
    tasks = tasks.filter((t) => statuses.includes(t.status))
  }
  if (filter.search) {
    const q = filter.search.toLowerCase()
    tasks = tasks.filter((t) =>
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q),
    )
  }

  return tasks
}

export function getChildren(tasks: TaskData[], epicId: string): TaskData[] {
  return tasks.filter((t) => t.parent === epicId)
}

export function getActiveChildren(dir: string, taskId: string): TaskData[] {
  const tasks = listTasks({ dir })
  return getChildren(tasks, taskId)
}

export function orphanChildren(dir: string, parentId: string): void {
  const children = getActiveChildren(dir, parentId)
  for (const child of children) {
    const { filePath, task } = findTaskFile(dir, child.id)
    delete task.parent
    const orphanMarker = `<orphan of ${parentId}>`
    task.flag = task.flag ? `${task.flag} ${orphanMarker}` : orphanMarker
    writeFileSync(filePath, render(task))
  }
}

export function cascadeClose(dir: string, parentId: string, status: Status): void {
  const children = getActiveChildren(dir, parentId)
  for (const child of children) {
    closeTask(dir, child.id, undefined, status)
  }
}

export function getBlockedBy(tasks: TaskData[], taskId: string): TaskData[] {
  return tasks.filter((t) => t.blocks?.includes(taskId))
}

export function validateParent(
  tasks: TaskData[],
  parentId: string,
): { valid: boolean; reason?: string } {
  const target = tasks.find((t) => t.id === parentId)
  if (!target) return { valid: false, reason: `Task ${parentId} not found` }
  if (target.parent)
    return {
      valid: false,
      reason: `Task ${parentId} already has a parent — only one level of nesting allowed`,
    }
  return { valid: true }
}

export function validateBlocks(
  tasks: TaskData[],
  blockIds: string[],
): { valid: boolean; reason?: string } {
  const ids = new Set(tasks.map((t) => t.id))
  const missing = blockIds.filter((id) => !ids.has(id))
  if (missing.length > 0)
    return { valid: false, reason: `Tasks not found: ${missing.join(', ')}` }
  return { valid: true }
}

export function buildRelationshipIndicators(
  tasks: TaskData[],
  task: TaskData,
): { blocksDisplay: string | null; blockedByDisplay: string | null } {
  const blocksDisplay =
    task.blocks && task.blocks.length > 0
      ? `${EMOJI.blocks} ${task.blocks.join(', ')}`
      : null

  const blockedBy = getBlockedBy(tasks, task.id)
  const blockedByDisplay =
    blockedBy.length > 0
      ? `${EMOJI.blocked_by} ${blockedBy.map((t) => t.id).join(', ')}`
      : null

  return { blocksDisplay, blockedByDisplay }
}

export function groupByEpic(tasks: TaskData[]): GroupedTask[] {
  const parentIds = new Set(
    tasks.filter((t) => t.parent).map((t) => t.parent!),
  )
  // Epics: tasks that have children in this list
  const epics = tasks.filter((t) => parentIds.has(t.id))
  const epicIds = new Set(epics.map((t) => t.id))

  // Children grouped by parent (only if parent is in the list)
  const childrenByParent = new Map<string, TaskData[]>()
  for (const t of tasks) {
    if (t.parent && epicIds.has(t.parent)) {
      const children = childrenByParent.get(t.parent) ?? []
      children.push(t)
      childrenByParent.set(t.parent, children)
    }
  }

  // Standalone: not an epic and not a child (or orphan child whose parent isn't in list)
  const childTaskIds = new Set(
    [...childrenByParent.values()].flat().map((t) => t.id),
  )
  const standalone = tasks.filter(
    (t) => !epicIds.has(t.id) && !childTaskIds.has(t.id),
  )

  const result: GroupedTask[] = []

  for (const epic of epics) {
    const indicators = buildRelationshipIndicators(tasks, epic)
    result.push({
      task: epic,
      indent: 0,
      blocksIndicator: indicators.blocksDisplay,
      blockedByIndicator: indicators.blockedByDisplay,
    })
    for (const child of childrenByParent.get(epic.id) ?? []) {
      const childIndicators = buildRelationshipIndicators(tasks, child)
      result.push({
        task: child,
        indent: 1,
        blocksIndicator: childIndicators.blocksDisplay,
        blockedByIndicator: childIndicators.blockedByDisplay,
      })
    }
  }

  for (const t of standalone) {
    const indicators = buildRelationshipIndicators(tasks, t)
    result.push({
      task: t,
      indent: 0,
      blocksIndicator: indicators.blocksDisplay,
      blockedByIndicator: indicators.blockedByDisplay,
    })
  }

  return result
}

export function resolveTaskId(dir: string, id: string): string {
  if (/^\d+$/.test(id)) {
    const config = loadConfig(dir)
    return `${config.prefix}-${id.padStart(3, '0')}`
  }
  return id
}

export function findTaskFile(
  dir: string,
  id: string,
): { filePath: string; task: TaskData; inArchive: boolean } {
  const config = loadConfig(dir)
  const tasksDir = join(dir, config.tasks_dir)
  const archiveDir = join(tasksDir, '.archive')
  const resolved = resolveTaskId(dir, id)
  const idUpper = resolved.toUpperCase()

  // Search active tasks first
  const activeFiles = readdirSync(tasksDir).filter(
    (f) => f.endsWith('.md') && f.toUpperCase().startsWith(idUpper),
  )
  if (activeFiles.length > 0) {
    const filePath = join(tasksDir, activeFiles[0])
    const content = readFileSync(filePath, 'utf-8')
    return { filePath, task: parse(content, activeFiles[0]), inArchive: false }
  }

  // Search archive
  if (existsSync(archiveDir)) {
    const archiveFiles = readdirSync(archiveDir).filter(
      (f) => f.endsWith('.md') && f.toUpperCase().startsWith(idUpper),
    )
    if (archiveFiles.length > 0) {
      const filePath = join(archiveDir, archiveFiles[0])
      const content = readFileSync(filePath, 'utf-8')
      return { filePath, task: parse(content, archiveFiles[0]), inArchive: true }
    }
  }

  throw new Error(`Task ${resolved} not found`)
}

export function updateTask(
  dir: string,
  id: string,
  updates: EditTaskResult,
): TaskData {
  const config = loadConfig(dir)
  const { filePath, task } = findTaskFile(dir, id)

  // Preserve immutable fields (id, created), apply updates
  task.type = updates.type
  task.status = updates.status
  task.title = normalizeTitle(updates.title)
  task.description = updates.description ?? ''
  task.acceptance_criteria = updates.acceptance_criteria ?? []
  task.priority = updates.priority ?? 3
  if (updates.flag !== undefined) {
    task.flag = updates.flag || undefined
  }

  if (updates.parent !== undefined) {
    task.parent = updates.parent || undefined
  }
  if (updates.blocks !== undefined) {
    task.blocks = updates.blocks?.length ? updates.blocks : undefined
  }

  // Handle filename change if verbose_files is enabled
  if (config.verbose_files) {
    const parentDir = filePath.substring(0, filePath.lastIndexOf('/'))
    const newFilename = `${task.id} ${task.type} - ${task.title}.md`
    const newPath = join(parentDir, newFilename)
    if (newPath !== filePath) {
      writeFileSync(newPath, render(task))
      unlinkSync(filePath)
      return task
    }
  }

  writeFileSync(filePath, render(task))
  return task
}

export function patchTask(
  dir: string,
  id: string,
  patch: PatchTaskOpts,
): TaskData {
  const config = loadConfig(dir)
  const { filePath, task } = findTaskFile(dir, id)

  if (patch.type !== undefined) task.type = patch.type
  if (patch.status !== undefined) task.status = patch.status
  if (patch.priority !== undefined) task.priority = patch.priority
  if (patch.flag === null) delete task.flag
  else if (patch.flag !== undefined) task.flag = patch.flag
  if (patch.title !== undefined) task.title = normalizeTitle(patch.title)
  if (patch.description !== undefined) task.description = patch.description
  if (patch.acceptance_criteria !== undefined) task.acceptance_criteria = patch.acceptance_criteria
  if (patch.parent === null) delete task.parent
  else if (patch.parent !== undefined) task.parent = patch.parent
  if (patch.blocks === null) delete task.blocks
  else if (patch.blocks !== undefined) task.blocks = patch.blocks

  if (config.verbose_files) {
    const parentDir = filePath.substring(0, filePath.lastIndexOf('/'))
    const newFilename = `${task.id} ${task.type} - ${task.title}.md`
    const newPath = join(parentDir, newFilename)
    if (newPath !== filePath) {
      writeFileSync(newPath, render(task))
      unlinkSync(filePath)
      return task
    }
  }

  writeFileSync(filePath, render(task))
  return task
}

export function closeTask(
  dir: string,
  id: string,
  reason?: string,
  status: Status = 'closed',
): string {
  const config = loadConfig(dir)
  const tasksDir = join(dir, config.tasks_dir)

  const resolved = resolveTaskId(dir, id)
  const idUpper = resolved.toUpperCase()
  const file = readdirSync(tasksDir).find(
    (f) => f.endsWith('.md') && f.toUpperCase().startsWith(idUpper),
  )

  if (!file) {
    throw new Error(`Task ${resolved} not found`)
  }

  const filePath = join(tasksDir, file)
  const content = readFileSync(filePath, 'utf-8')
  const task = parse(content, file)
  task.status = status
  if (reason) {
    task.flag = reason
  }
  if (status === 'done' && task.acceptance_criteria.length > 0) {
    task.checked_criteria = true
  }

  const archivePath = join(tasksDir, '.archive', file)
  writeFileSync(archivePath, render(task))
  unlinkSync(filePath)
  return resolved
}
