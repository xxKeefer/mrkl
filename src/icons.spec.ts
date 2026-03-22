import { describe, expect, it } from 'vitest'
import { priorityIcon, getIcon, statusIcon, ICONS } from './icons.js'
import type { Priority, Status } from './types.js'

describe('ICONS', () => {
  it('all values are exactly 1 character', () => {
    for (const [key, value] of Object.entries(ICONS)) {
      expect(value.length, `ICONS.${key} should be 1 char`).toBe(1)
    }
  })

  it('contains status icons', () => {
    expect(ICONS.todo).toBe('○')
    expect(ICONS.in_progress).toBe('◑')
    expect(ICONS.done).toBe('✔')
    expect(ICONS.closed).toBe('✖')
  })
})

describe('priorityIcon', () => {
  const cases: Array<[Priority, string]> = [
    [1, '▼'],
    [2, '▽'],
    [3, '◇'],
    [4, '△'],
    [5, '▲'],
  ]

  it.each(cases)('maps priority %d to %s', (priority, expected) => {
    expect(priorityIcon(priority)).toBe(expected)
  })
})

describe('statusIcon', () => {
  const cases: Array<[Status, string]> = [
    ['todo', '○'],
    ['in-progress', '◑'],
    ['done', '✔'],
    ['closed', '✖'],
  ]

  it.each(cases)('maps %s to %s', (status, expected) => {
    expect(statusIcon(status)).toBe(expected)
  })
})

describe('getIcon', () => {
  it('returns the icon for a key', () => {
    expect(getIcon('success')).toBe('✔')
    expect(getIcon('blocks')).toBe('«')
    expect(getIcon('priority_highest')).toBe('▲')
    expect(getIcon('epic')).toBe('◉')
    expect(getIcon('flag')).toBe('⚑')
  })
})
