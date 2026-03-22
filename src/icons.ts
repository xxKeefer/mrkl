import type { Priority, Status } from './types.js'

export const ICONS = {
  // Log badges (vitest/consola standard)
  success:          '✔',
  error:            '✖',
  warn:             '⚠',
  info:             'ℹ',

  // Task status (replaces status text in list views)
  todo:             '○',
  in_progress:      '◑',
  done:             '✔',
  closed:           '✖',
  // Future pipeline stages:
  // code_review:   '◔',
  // qa:            '◕',

  // Relations
  blocks:           '«',
  blocked_by:       '»',

  // Hierarchy
  epic:             '◉',
  child:            '◌',

  // Priority (lowest → highest)
  priority_lowest:  '▼',
  priority_low:     '▽',
  priority_normal:  '◇',
  priority_high:    '△',
  priority_highest: '▲',

  // Actions
  create:           '◇',
  update:           '◈',
  delete:           '✖',

  // Misc
  empty:            '○',
  celebrate:        '★',
  module:           '◉',
  quit:             '·',
  found:            '◆',
  not_found:        '?',
  flag:             '⚑',
} as const

export type IconKey = keyof typeof ICONS

export function getIcon(key: IconKey): string {
  return ICONS[key]
}

const PRIORITY_KEYS: Record<Priority, IconKey> = {
  1: 'priority_lowest',
  2: 'priority_low',
  3: 'priority_normal',
  4: 'priority_high',
  5: 'priority_highest',
}

export function priorityIcon(p: Priority): string {
  return ICONS[PRIORITY_KEYS[p]]
}

const STATUS_KEYS: Record<Status, IconKey> = {
  'todo': 'todo',
  'in-progress': 'in_progress',
  'done': 'done',
  'closed': 'closed',
}

export function statusIcon(status: Status): string {
  const key = STATUS_KEYS[status]
  return key ? ICONS[key] : status
}
