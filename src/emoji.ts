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
  priority_lowest: '\u23EC', // ⏬
  priority_low: '\u{1F53D}', // 🔽
  priority_normal: '\u23F9\uFE0F', // ⏹️
  priority_high: '\u{1F53C}', // 🔼
  priority_highest: '\u23EB', // ⏫
} as const

export type EmojiKey = keyof typeof EMOJI

const PRIORITY_EMOJI: Record<Priority, string> = {
  1: EMOJI.priority_lowest,
  2: EMOJI.priority_low,
  3: EMOJI.priority_normal,
  4: EMOJI.priority_high,
  5: EMOJI.priority_highest,
}

export function priorityEmoji(p: Priority): string {
  return PRIORITY_EMOJI[p]
}
