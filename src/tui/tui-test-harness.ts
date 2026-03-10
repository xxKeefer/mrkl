import { Terminal, type IBufferLine } from '@xterm/headless'

export function renderToScreen(ansiOutput: string, cols: number, rows: number): Promise<string> {
  return new Promise((resolve) => {
    const terminal = new Terminal({ cols, rows, allowProposedApi: true })

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
