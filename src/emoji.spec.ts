import { describe, expect, it } from 'vitest'
import { priorityEmoji } from './emoji.js'
import type { Priority } from './types.js'

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
