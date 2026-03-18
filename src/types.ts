export const TASK_TYPES = [
  'feat',
  'fix',
  'chore',
  'docs',
  'perf',
  'refactor',
  'test',
  'ci',
  'build',
  'style',
] as const

export type TaskType = (typeof TASK_TYPES)[number]

export const STATUSES = ['todo', 'in-progress', 'done', 'closed'] as const

export type Status = (typeof STATUSES)[number]

export const PRIORITIES = [1, 2, 3, 4, 5] as const

export type Priority = (typeof PRIORITIES)[number]

export interface Config {
  prefix: string
  tasks_dir: string
  verbose_files: boolean
}

export interface TaskData {
  id: string
  type: TaskType
  status: Status
  created: string
  priority?: Priority
  flag?: string
  parent?: string
  blocks?: string[]
  title: string
  description: string
  acceptance_criteria: string[]
  checked_criteria?: boolean
}

export interface CreateTaskOpts {
  dir: string
  type: TaskType
  title: string
  description?: string
  acceptance_criteria?: string[]
  priority?: Priority
  flag?: string
  parent?: string
  blocks?: string[]
}

export interface ListFilter {
  dir: string
  type?: string
  status?: string
  search?: string
}

export interface EditTaskResult {
  type: TaskType
  status: Status
  priority?: Priority
  flag?: string
  title: string
  description?: string
  acceptance_criteria?: string[]
  parent?: string
  blocks?: string[]
}

export interface GroupedTask {
  task: TaskData
  indent: number // 0 = top-level, 1 = child of epic
  blocksIndicator: string | null // e.g. "⛔► MRKL-010, MRKL-012"
  blockedByIndicator: string | null // e.g. "◄⛔ MRKL-005"
}

export interface PatchTaskOpts {
  type?: TaskType
  status?: Status
  priority?: Priority
  flag?: string | null
  title?: string
  description?: string
  acceptance_criteria?: string[]
  parent?: string | null
  blocks?: string[] | null
}

export interface PruneResult {
  deleted: Array<{
    id: string
    title: string
    created: string
    filename: string
  }>
  total: number
}
