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
    expect(state).toEqual({ preview_open: true, theme: 'emoji' })
  })

  it('reads existing state file', () => {
    const filePath = join(tempDir, '.tasks', STATE_FILE)
    const data = JSON.stringify({ preview_open: false, theme: 'ascii' })
    writeFileSync(filePath, data)
    const state = readState()
    expect(state.preview_open).toBe(false)
    expect(state.theme).toBe('ascii')
  })

  it('writeState merges patches into existing state', () => {
    writeState({ preview_open: false })
    const state = readState()
    expect(state.preview_open).toBe(false)
    expect(state.theme).toBe('emoji') // default preserved
  })

  it('writeState creates file if missing', () => {
    writeState({ theme: 'ascii' })
    const raw = readFileSync(join(tempDir, '.tasks', STATE_FILE), 'utf-8')
    const data = JSON.parse(raw)
    expect(data.theme).toBe('ascii')
    expect(data.preview_open).toBe(true)
  })

  it('round-trips correctly', () => {
    writeState({ preview_open: false, theme: 'ascii' })
    writeState({ preview_open: true })
    const state = readState()
    expect(state).toEqual({ preview_open: true, theme: 'ascii' })
  })
})
