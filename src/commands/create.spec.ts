import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toPriority } from './create.js'

vi.mock('../logger.js', () => ({
  logger: {
    error: vi.fn(),
    create: vi.fn(),
  },
}))

describe('toPriority', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns undefined for falsy values', () => {
    expect(toPriority(undefined)).toBeUndefined()
    expect(toPriority('')).toBeUndefined()
    expect(toPriority(null)).toBeUndefined()
  })

  it('returns the number for valid priorities 1-5', () => {
    expect(toPriority('1')).toBe(1)
    expect(toPriority('2')).toBe(2)
    expect(toPriority('3')).toBe(3)
    expect(toPriority('4')).toBe(4)
    expect(toPriority('5')).toBe(5)
  })

  it('exits for invalid numeric values', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    toPriority('0')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('exits for out-of-range values', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    toPriority('6')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('exits for non-numeric values', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    toPriority('abc')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
