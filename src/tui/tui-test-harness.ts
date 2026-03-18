import { Terminal, type IBufferLine } from '@xterm/headless'
import * as nodePty from 'node-pty'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { TaskData } from '../types.js'
import type { FormState, FormMode } from './create-tui.js'
import type { ListRenderState } from './list-tui.js'
export type { FzfEntry, ListRenderState } from './list-tui.js'

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../../..')
const TSX_BIN = resolve(PROJECT_ROOT, 'node_modules/.bin/tsx')

export interface TuiProcess {
  write(data: string): void
  readScreen(): string
  waitForContent(match: string | RegExp, timeout?: number): Promise<string>
  exitCode: Promise<number>
  kill(): void
}

export function spawnTui(
  command: string,
  opts: { cols?: number; rows?: number; cwd?: string } = {},
): TuiProcess {
  const cols = opts.cols ?? 80
  const rows = opts.rows ?? 24

  const terminal = new Terminal({ cols, rows, allowProposedApi: true, convertEol: false })

  const cliPath = resolve(PROJECT_ROOT, 'src/cli.ts')

  const pty = nodePty.spawn(TSX_BIN, [cliPath, ...command.split(/\s+/)], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: opts.cwd ?? PROJECT_ROOT,
    env: { ...process.env, FORCE_COLOR: '1' },
  })

  const exitCode = new Promise<number>((resolveExit) => {
    pty.onExit(({ exitCode: code }) => resolveExit(code))
  })

  pty.onData((data: string) => {
    terminal.write(data)
  })

  function readScreen(): string {
    const buffer = terminal.buffer.active
    const lines: string[] = []
    for (let i = 0; i < rows; i++) {
      const line: IBufferLine | undefined = buffer.getLine(i)
      lines.push(line ? line.translateToString(false) : ' '.repeat(cols))
    }
    return trimTrailingBlankLines(lines).join('\n')
  }

  function waitForContent(match: string | RegExp, timeout = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = (): void => {
        const screen = readScreen()
        const found = typeof match === 'string' ? screen.includes(match) : match.test(screen)
        if (found) return resolve(screen)
        if (Date.now() - start > timeout) {
          return reject(new Error(`Timed out waiting for ${String(match)}.\nScreen:\n${screen}`))
        }
        setTimeout(check, 50)
      }
      check()
    })
  }

  return {
    write: (data: string) => pty.write(data),
    readScreen,
    waitForContent,
    exitCode,
    kill: () => {
      pty.kill()
      terminal.dispose()
    },
  }
}

export function renderToScreen(ansiOutput: string, cols: number, rows: number): Promise<string> {
  return new Promise((resolve) => {
    const terminal = new Terminal({ cols, rows, allowProposedApi: true, convertEol: true })

    terminal.write(ansiOutput, () => {
      const buffer = terminal.buffer.active
      const lines: string[] = []
      for (let i = 0; i < rows; i++) {
        const line: IBufferLine | undefined = buffer.getLine(i)
        lines.push(line ? line.translateToString(false) : ' '.repeat(cols))
      }
      terminal.dispose()
      resolve(trimTrailingBlankLines(lines).join('\n'))
    })
  })
}

function trimTrailingBlankLines(lines: string[]): string[] {
  let end = lines.length
  while (end > 0 && lines[end - 1]!.trim() === '') end--
  return lines.slice(0, Math.max(end, 1))
}

export type MockStdout = NodeJS.WriteStream & {
  getOutput(): string
  reset(): void
}

export function createMockStdout(columns: number, rows: number): MockStdout {
  let buffer = ''

  return {
    columns,
    rows,
    write(data: string | Uint8Array): boolean {
      buffer += typeof data === 'string' ? data : new TextDecoder().decode(data)
      return true
    },
    getOutput(): string {
      return buffer
    },
    reset(): void {
      buffer = ''
    },
  } as MockStdout
}

export function makeTask(overrides?: Partial<TaskData>): TaskData {
  return {
    id: 'TEST-001',
    type: 'feat',
    status: 'todo',
    created: '2025-01-01',
    title: 'Test task',
    description: '',
    acceptance_criteria: [],
    ...overrides,
  }
}

export function makeFormState(overrides?: Partial<FormState>): FormState {
  return {
    type: 0,
    status: 0,
    priority: 2,
    title: '',
    description: '',
    flag: '',
    parent: '',
    parentInput: '',
    parentCandidates: [],
    parentHighlight: 0,
    blocks: [],
    currentBlock: '',
    blockCandidates: [],
    blockHighlight: 0,
    criteria: [],
    currentCriterion: '',
    activeField: 0,
    cursorPos: 0,
    error: '',
    mode: 'create' as FormMode,
    ...overrides,
  }
}

export function makeListState(overrides?: Partial<ListRenderState>): ListRenderState {
  return {
    activeTab: 0,
    query: '',
    selectedIndex: 0,
    scrollOffset: 0,
    datasets: [
      { label: 'Tasks', entries: [] },
      { label: 'Archive', entries: [] },
    ],
    filtered: [],
    allTasks: [],
    ...overrides,
  }
}
