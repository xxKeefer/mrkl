import { describe, expect, it, afterEach } from 'vitest'
import { priorityEmoji, getIcon, setAsciiMode, isAsciiMode } from './emoji.js'
import type { Priority } from './types.js'

afterEach(() => setAsciiMode(false))

describe('priorityEmoji', () => {
  const cases: Array<[Priority, string]> = [
    [1, '⏬'],
    [2, '🔽'],
    [3, '⏹️'],
    [4, '🔼'],
    [5, '⏫'],
  ]

  it.each(cases)('maps priority %d to %s', (priority, expected) => {
    expect(priorityEmoji(priority)).toBe(expected)
  })
})

describe('getIcon', () => {
  it('returns emoji by default', () => {
    expect(getIcon('success')).toBe('🟢')
    expect(getIcon('blocks')).toBe('🚧')
  })

  it('returns ASCII in ascii mode', () => {
    setAsciiMode(true)
    expect(getIcon('success')).toBe('●')
    expect(getIcon('blocks')).toBe('►')
    expect(getIcon('priority_highest')).toBe('▲')
  })

  it('priorityEmoji respects ascii mode', () => {
    setAsciiMode(true)
    expect(priorityEmoji(5)).toBe('▲')
    expect(priorityEmoji(1)).toBe('▼')
  })
})

describe('setAsciiMode', () => {
  it('toggles mode', () => {
    expect(isAsciiMode()).toBe(false)
    setAsciiMode(true)
    expect(isAsciiMode()).toBe(true)
    setAsciiMode(false)
    expect(isAsciiMode()).toBe(false)
  })
})
