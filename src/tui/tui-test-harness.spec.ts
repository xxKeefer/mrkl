import { describe, it, expect } from 'vitest'
import { createMockStdout } from './tui-test-harness.js'

describe('createMockStdout', () => {
  it('returns object with configured columns and rows', () => {
    const stdout = createMockStdout(120, 40)
    expect(stdout.columns).toBe(120)
    expect(stdout.rows).toBe(40)
  })

  it('captures written data and returns it via getOutput', () => {
    const stdout = createMockStdout(80, 24)
    stdout.write('hello ')
    stdout.write('world')
    expect(stdout.getOutput()).toBe('hello world')
  })

  it('reset clears the captured buffer', () => {
    const stdout = createMockStdout(80, 24)
    stdout.write('first render')
    stdout.reset()
    expect(stdout.getOutput()).toBe('')
    stdout.write('second render')
    expect(stdout.getOutput()).toBe('second render')
  })
})
