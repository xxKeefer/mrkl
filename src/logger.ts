import consola from 'consola'
import { EMOJI, type EmojiKey } from './emoji.js'

const LEVEL_MAP: Record<EmojiKey, 'success' | 'error' | 'warn' | 'info'> = {
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
}

type LogMethod = (message: string, ...args: unknown[]) => void

type Logger = Record<EmojiKey, LogMethod> & {
  log: (...args: unknown[]) => void
  prompt: typeof consola.prompt
}

function createLogger(): Logger {
  const methods = {} as Record<EmojiKey, LogMethod>
  for (const key of Object.keys(EMOJI) as EmojiKey[]) {
    methods[key] = (message, ...args) => {
      consola[LEVEL_MAP[key]](`${EMOJI[key]} ${message}`, ...args)
    }
  }
  return {
    ...methods,
    log: (...args: Parameters<typeof consola.log>) => consola.log(...args),
    prompt: consola.prompt,
  }
}

export const logger = createLogger()
