import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  existsSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadConfig, initConfig } from '../src/config.js'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'mrkl-test-'))
})

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

describe('config', () => {
  describe('loadConfig', () => {
    it('reads mrkl.toml and returns Config', () => {
      writeFileSync(
        join(tmp, 'mrkl.toml'),
        'prefix = "TEST"\ntasks_dir = ".tasks"\n',
      )
      const config = loadConfig(tmp)
      expect(config).toEqual({
        prefix: 'TEST',
        tasks_dir: '.tasks',
        verbose_files: false,
      })
    })

    it('prefers .config/mrkl/mrkl.toml over root', () => {
      writeFileSync(
        join(tmp, 'mrkl.toml'),
        'prefix = "ROOT"\ntasks_dir = ".tasks"\n',
      )
      mkdirSync(join(tmp, '.config', 'mrkl'), { recursive: true })
      writeFileSync(
        join(tmp, '.config', 'mrkl', 'mrkl.toml'),
        'prefix = "NESTED"\ntasks_dir = ".tasks"\n',
      )
      const config = loadConfig(tmp)
      expect(config.prefix).toBe('NESTED')
    })
    it('falls back to root mrkl.toml', () => {
      writeFileSync(
        join(tmp, 'mrkl.toml'),
        'prefix = "ROOT"\ntasks_dir = ".tasks"\n',
      )
      const config = loadConfig(tmp)
      expect(config.prefix).toBe('ROOT')
    })
    it('throws if mrkl.toml not found', () => {
      expect(() => loadConfig(tmp)).toThrow('mrkl.toml not found')
    })
    it('applies default tasks_dir when not specified', () => {
      writeFileSync(join(tmp, 'mrkl.toml'), 'prefix = "TEST"\n')
      const config = loadConfig(tmp)
      expect(config.tasks_dir).toBe('.tasks')
    })
    it('returns verbose_files true when set in toml', () => {
      writeFileSync(
        join(tmp, 'mrkl.toml'),
        'prefix = "TEST"\nverbose_files = true\n',
      )
      const config = loadConfig(tmp)
      expect(config.verbose_files).toBe(true)
    })
    it('defaults verbose_files to false', () => {
      writeFileSync(join(tmp, 'mrkl.toml'), 'prefix = "TEST"\n')
      const config = loadConfig(tmp)
      expect(config.verbose_files).toBe(false)
    })
  })

  describe('initConfig', () => {
    it('creates mrkl.toml with given prefix', () => {
      initConfig(tmp, { prefix: 'FOO' })
      const config = loadConfig(tmp)
      expect(config.prefix).toBe('FOO')
      expect(config.tasks_dir).toBe('.tasks')
    })
    it('creates .tasks directory and .archive subdirectory', () => {
      initConfig(tmp, { prefix: 'FOO' })
      expect(existsSync(join(tmp, '.tasks'))).toBe(true)
      expect(existsSync(join(tmp, '.tasks', '.archive'))).toBe(true)
    })
    it('creates mrkl_counter file starting at 0', () => {
      initConfig(tmp, { prefix: 'FOO' })
      const counter = readFileSync(
        join(tmp, '.config', 'mrkl', 'mrkl_counter'),
        'utf-8',
      )
      expect(counter).toBe('0')
    })
    it('writes verbose_files to config', () => {
      initConfig(tmp, { prefix: 'FOO', verbose_files: true })
      const config = loadConfig(tmp)
      expect(config.verbose_files).toBe(true)
    })
    it('is idempotent — does not overwrite existing config or reset counter', () => {
      initConfig(tmp, { prefix: 'FOO' })
      // Simulate counter advancement
      writeFileSync(join(tmp, '.config', 'mrkl', 'mrkl_counter'), '5')
      // Run again — should not reset
      initConfig(tmp, { prefix: 'BAR' })
      const config = loadConfig(tmp)
      expect(config.prefix).toBe('FOO')
      const counter = readFileSync(
        join(tmp, '.config', 'mrkl', 'mrkl_counter'),
        'utf-8',
      )
      expect(counter).toBe('5')
    })
  })
})
