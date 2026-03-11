import { Terminal, type IBufferLine } from '@xterm/headless'
import type { TaskData } from '../types.js'
import type { FormState, FormMode } from './create-tui.js'
import type { ListRenderState } from './list-tui.js'
export type { FzfEntry, ListRenderState } from './list-tui.js'

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
    title: '',
    description: '',
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
