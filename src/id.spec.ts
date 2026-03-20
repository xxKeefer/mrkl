import { describe, it, expect } from 'vitest'
import { TASKS_DIR, generateId } from './id.js'

describe('id', () => {
  it('exports TASKS_DIR as .tasks', () => {
    expect(TASKS_DIR).toBe('.tasks')
  })

  it('returns an id matching ddd-mmmmmm format', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-z]{3,}-[0-9a-z]{6}$/)
  })

  it('encodes days-since-epoch as the left component', () => {
    const id = generateId()
    const [daysB36] = id.split('-')
    const expectedDays = Math.floor(Date.now() / 86_400_000)
    expect(parseInt(daysB36, 36)).toBe(expectedDays)
  })

  it('encodes millis-since-midnight as the right component within valid range', () => {
    const id = generateId()
    const millisB36 = id.split('-')[1]
    const millis = parseInt(millisB36, 36)
    expect(millis).toBeGreaterThanOrEqual(0)
    expect(millis).toBeLessThan(86_400_000)
  })

  it('produces IDs that sort lexicographically in chronological order', async () => {
    const ids: string[] = []
    for (let i = 0; i < 5; i++) {
      ids.push(generateId())
      await new Promise((r) => setTimeout(r, 5))
    }
    const sorted = [...ids].sort()
    expect(sorted).toEqual(ids)
  })
})
