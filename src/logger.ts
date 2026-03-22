import consola from 'consola'
import { ICONS, getIcon, type IconKey } from './icons.js'

type Level = 'success' | 'error' | 'warn' | 'info'

const LEVEL_MAP: Record<IconKey, Level> = {
  success: 'success',
  error: 'error',
  warn: 'warn',
  info: 'info',
  todo: 'info',
  in_progress: 'info',
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
  epic: 'info',
  child: 'info',
}

type LogMethod = (message: string, ...args: unknown[]) => void

type Logger = Record<IconKey, LogMethod> & {
  log: (...args: unknown[]) => void
  prompt: typeof consola.prompt
}

function createLogger(): Logger {
  const methods = {} as Record<IconKey, LogMethod>
  for (const key of Object.keys(ICONS) as IconKey[]) {
    const level = LEVEL_MAP[key]
    const isBaseLevel = key === level
    methods[key] = (message, ...args) => {
      const badge = getIcon(level as IconKey)
      const prefix = isBaseLevel
        ? `${badge} — ${message}`
        : `${badge} — ${getIcon(key)} ${message}`
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
