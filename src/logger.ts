import consola from 'consola'
import { EMOJI, type EmojiKey } from './emoji.js'

type Level = 'success' | 'error' | 'warn' | 'info'

const LEVEL_MAP: Record<EmojiKey, Level> = {
  success: 'success',
  error: 'error',
  warn: 'warn',
  info: 'info',
  done: 'success',
  closed: 'info',
  blocks: 'info',
  blocked_by: 'info',
  create: 'success',
  update: 'success',
  delete: 'success',
  empty: 'info',
  celebrate: 'success',
  module: 'success',
  quit: 'info',
  found: 'info',
  not_found: 'info',
  flag: 'info',
  priority_lowest: 'info',
  priority_low: 'info',
  priority_normal: 'info',
  priority_high: 'info',
  priority_highest: 'info',
}

const LEVEL_EMOJI: Record<Level, string> = {
  success: EMOJI.success,
  error: EMOJI.error,
  warn: EMOJI.warn,
  info: EMOJI.info,
}

type LogMethod = (message: string, ...args: unknown[]) => void

type Logger = Record<EmojiKey, LogMethod> & {
  log: (...args: unknown[]) => void
  prompt: typeof consola.prompt
}

function createLogger(): Logger {
  const methods = {} as Record<EmojiKey, LogMethod>
  for (const key of Object.keys(EMOJI) as EmojiKey[]) {
    const level = LEVEL_MAP[key]
    const badge = LEVEL_EMOJI[level]
    const isBaseLevel = key === level
    methods[key] = (message, ...args) => {
      const prefix = isBaseLevel
        ? `${badge} — ${message}`
        : `${badge} — ${EMOJI[key]} ${message}`
      consola.log(prefix, ...args)
    }
  }
  return {
    ...methods,
    log: (...args: Parameters<typeof consola.log>) => consola.log(...args),
    prompt: consola.prompt,
  }
}

export const logger = createLogger()
