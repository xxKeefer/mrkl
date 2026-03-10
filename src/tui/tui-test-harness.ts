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
