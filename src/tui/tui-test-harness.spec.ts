import { describe, it, expect } from 'vitest'
import { createMockStdout, renderToScreen } from './tui-test-harness.js'
import { CLEAR_SCREEN, BOLD, RESET, FG_CYAN } from './ansi.js'

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

describe('renderToScreen', () => {
  it('renders plain text to the screen buffer', async () => {
    const result = await renderToScreen('hello world', 80, 24)
    expect(result).toContain('hello world')
  })

  it('strips ANSI color codes from output', async () => {
    const ansi = `${FG_CYAN}${BOLD}colored text${RESET}`
    const result = await renderToScreen(ansi, 80, 24)
    expect(result).toContain('colored text')
    expect(result).not.toContain('\x1b[')
  })

  it('CLEAR_SCREEN resets buffer — only post-clear content appears', async () => {
    const ansi = `before${CLEAR_SCREEN}after`
    const result = await renderToScreen(ansi, 80, 24)
    expect(result).toContain('after')
    expect(result).not.toContain('before')
  })

  it('cursor positioning places content at correct position', async () => {
    // Move cursor to row 2, col 5 then write
    const ansi = '\x1b[2;5Hplaced'
    const result = await renderToScreen(ansi, 80, 24)
    const lines = result.split('\n')
    // Row 2 (index 1) should contain 'placed' starting at col 5 (index 4)
    expect(lines[1]?.slice(4, 10)).toBe('placed')
  })
})
