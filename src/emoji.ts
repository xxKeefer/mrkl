import type { Priority } from './types.js'

export const EMOJI = {
  success: '\u{1F7E2}', // 🟢
  error: '\u{1F534}', // 🔴
  warn: '\u{1F7E1}', // 🟡
  info: '\u{1F535}', // 🔵
  done: '\u2705', // ✅
  closed: '\u274C', // ❌
  blocks: '\u{1F6A7}', // 🚧
  blocked_by: '\u{1F6D1}', // 🛑
  create: '\u{1F4DD}', // 📝
  update: '\u270F\uFE0F', // ✏️
  delete: '\u{1F9F9}', // 🧹
  empty: '\u{1F4ED}', // 📭
  celebrate: '\u{1F389}', // 🎉
  module: '\u{1F9E9}', // 🧩
  quit: '\u270C\uFE0F', // ✌️
  found: '\u{1F50E}', // 🔎
  not_found: '\u2753', // ❓
  flag: '\u{1F6A9}', // 🚩
  epic: '\u2734\uFE0F', // ✴️
  child: '\u2747\uFE0F', // ❇️
  priority_lowest: '\u23EC', // ⏬
  priority_low: '\u{1F53D}', // 🔽
  priority_normal: '\u23F9\uFE0F', // ⏹️
  priority_high: '\u{1F53C}', // 🔼
  priority_highest: '\u23EB', // ⏫
} as const

const ASCII: Record<EmojiKey, string> = {
  success: '●',
  error: '✖',
  warn: '▲',
  info: '◆',
  done: '✔',
  closed: '✖',
  blocks: '►',
  blocked_by: '◄',
  create: '◇',
  update: '◈',
  delete: '▬',
  empty: '○',
  celebrate: '★',
  module: '◉',
  quit: '·',
  found: '►',
  not_found: '?',
  flag: '⚑',
  epic: '◉',
  child: '·',
  priority_lowest: '▼',
  priority_low: '▽',
  priority_normal: '—',
  priority_high: '△',
  priority_highest: '▲',
}

export type EmojiKey = keyof typeof EMOJI

let asciiMode = false

export function setAsciiMode(on: boolean): void {
  asciiMode = on
}

export function isAsciiMode(): boolean {
  return asciiMode
}

export function getIcon(key: EmojiKey): string {
  return asciiMode ? ASCII[key] : EMOJI[key]
}

const PRIORITY_KEYS: Record<Priority, EmojiKey> = {
  1: 'priority_lowest',
  2: 'priority_low',
  3: 'priority_normal',
  4: 'priority_high',
  5: 'priority_highest',
}

export function priorityEmoji(p: Priority): string {
  return getIcon(PRIORITY_KEYS[p])
}
