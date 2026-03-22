import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readState, writeState, STATE_FILE } from './state.js'

describe('state', () => {
  let original: string
  let tempDir: string

  beforeEach(() => {
    original = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), 'mrkl-state-'))
    mkdirSync(join(tempDir, '.tasks'), { recursive: true })
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(original)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('returns defaults when state file is missing', () => {
    const state = readState()
    expect(state).toEqual({ preview_open: true })
  })

  it('reads existing state file', () => {
    const filePath = join(tempDir, '.tasks', STATE_FILE)
    writeFileSync(filePath, JSON.stringify({ preview_open: false }))
    const state = readState()
    expect(state.preview_open).toBe(false)
  })

  it('writeState merges patches into existing state', () => {
    writeState({ preview_open: false })
    const state = readState()
    expect(state.preview_open).toBe(false)
  })

  it('writeState creates file if missing', () => {
    writeState({ preview_open: false })
    const raw = readFileSync(join(tempDir, '.tasks', STATE_FILE), 'utf-8')
    const data = JSON.parse(raw)
    expect(data.preview_open).toBe(false)
  })

  it('round-trips correctly', () => {
    writeState({ preview_open: false })
    writeState({ preview_open: true })
    const state = readState()
    expect(state).toEqual({ preview_open: true })
  })
})
