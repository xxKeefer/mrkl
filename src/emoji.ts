import type { Priority } from './types.js'

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

// Backwards-compat aliases
export type EmojiKey = IconKey
export { ICONS as EMOJI }

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

export function priorityEmoji(p: Priority): string {
  return ICONS[PRIORITY_KEYS[p]]
}
