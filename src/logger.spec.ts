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

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const keys = Object.keys(EMOJI) as EmojiKey[]

  it.each(keys)('%s — calls consola.%s with emoji prefix', (key) => {
    const level = LEVEL_MAP[key]
    logger[key]('test message')
    expect(consola[level]).toHaveBeenCalledWith(`${EMOJI[key]} test message`)
  })

  it.each(keys)('%s — forwards extra arguments', (key) => {
    const level = LEVEL_MAP[key]
    logger[key]('msg', 42, { x: 1 })
    expect(consola[level]).toHaveBeenCalledWith(`${EMOJI[key]} msg`, 42, { x: 1 })
  })

  it('log — passes through to consola.log without emoji', () => {
    logger.log('raw output')
    expect(consola.log).toHaveBeenCalledWith('raw output')
  })

  it('prompt — re-exports consola.prompt', () => {
    expect(logger.prompt).toBe(consola.prompt)
  })
})
