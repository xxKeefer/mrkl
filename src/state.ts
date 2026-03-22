import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TASKS_DIR } from './id.js'

export const STATE_FILE = '.mrkl.json'

export interface MrklState {
  preview_open: boolean
}

const DEFAULTS: MrklState = {
  preview_open: true,
}

function statePath(): string {
  return join(process.cwd(), TASKS_DIR, STATE_FILE)
}

export function readState(): MrklState {
  try {
    const raw = readFileSync(statePath(), 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeState(patch: Partial<MrklState>): void {
  const current = readState()
  const merged = { ...current, ...patch }
  writeFileSync(statePath(), JSON.stringify(merged, null, 2) + '\n')
}
