export const EMOJI = {
  success: '\u{1F7E2}',
  error: '\u{1F534}',
  warn: '\u26A0\uFE0F',
  info: '\u2139\uFE0F',
  done: '\u2705',
  closed: '\u274C',
  blocks: '\u{1F6A7}',
  blocked_by: '\u{1F6D1}',
  create: '\u{1F4DD}',
  update: '\u270F\uFE0F',
  delete: '\u{1F9F9}',
  empty: '\u{1F4ED}',
  celebrate: '\u{1F389}',
  module: '\u{1F9E9}',
  quit: '\u270C\uFE0F',
  found: '\u{1F50E}',
  not_found: '\u2753',
  flag: '\u{1F6A9}',
} as const

export type EmojiKey = keyof typeof EMOJI
