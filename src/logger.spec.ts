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
}

const LEVEL_EMOJI: Record<Level, string> = {
  success: EMOJI.success,
  error: EMOJI.error,
  warn: EMOJI.warn,
  info: EMOJI.info,
}

function expectedPrefix(key: EmojiKey): string {
  const level = LEVEL_MAP[key]
  const badge = LEVEL_EMOJI[level]
  return key === level
    ? `${badge} — `
    : `${badge} — ${EMOJI[key]} `
}

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const keys = Object.keys(EMOJI) as EmojiKey[]

  it.each(keys)('%s — logs with level badge and emoji prefix', (key) => {
    logger[key]('test message')
    expect(consola.log).toHaveBeenCalledWith(`${expectedPrefix(key)}test message`)
  })

  it.each(keys)('%s — forwards extra arguments', (key) => {
    logger[key]('msg', 42, { x: 1 })
    expect(consola.log).toHaveBeenCalledWith(`${expectedPrefix(key)}msg`, 42, { x: 1 })
  })

  it('log — passes through to consola.log without emoji', () => {
    logger.log('raw output')
    expect(consola.log).toHaveBeenCalledWith('raw output')
  })

  it('prompt — re-exports consola.prompt', () => {
    expect(logger.prompt).toBe(consola.prompt)
  })
})
