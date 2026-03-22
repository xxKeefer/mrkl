import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('consola', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    prompt: vi.fn(),
  },
}))

import consola from 'consola'
import { logger } from './logger.js'
import { ICONS, type IconKey } from './emoji.js'

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

const LEVEL_ICONS: Record<Level, string> = {
  success: ICONS.success,
  error: ICONS.error,
  warn: ICONS.warn,
  info: ICONS.info,
}

function expectedPrefix(key: IconKey): string {
  const level = LEVEL_MAP[key]
  const badge = LEVEL_ICONS[level]
  return key === level
    ? `${badge} — `
    : `${badge} — ${ICONS[key]} `
}

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const keys = Object.keys(ICONS) as IconKey[]

  it.each(keys)('%s — logs with level badge and icon prefix', (key) => {
    logger[key]('test message')
    expect(consola.log).toHaveBeenCalledWith(`${expectedPrefix(key)}test message`)
  })

  it.each(keys)('%s — forwards extra arguments', (key) => {
    logger[key]('msg', 42, { x: 1 })
    expect(consola.log).toHaveBeenCalledWith(`${expectedPrefix(key)}msg`, 42, { x: 1 })
  })

  it('log — passes through to consola.log without icon', () => {
    logger.log('raw output')
    expect(consola.log).toHaveBeenCalledWith('raw output')
  })

  it('prompt — re-exports consola.prompt', () => {
    expect(logger.prompt).toBe(consola.prompt)
  })
})
