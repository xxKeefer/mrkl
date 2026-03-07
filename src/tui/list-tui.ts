import { Fzf } from 'fzf'
import type { TaskData } from '../types.js'

interface FzfEntry {
  task: TaskData
  searchText: string
}

const ESC = '\x1b'
const CSI = `${ESC}[`

const ALT_SCREEN_ON = `${CSI}?1049h`
const ALT_SCREEN_OFF = `${CSI}?1049l`
const CURSOR_HIDE = `${CSI}?25l`
const CURSOR_SHOW = `${CSI}?25h`
const CLEAR_SCREEN = `${CSI}2J${CSI}H`

const BOLD = `${CSI}1m`
const DIM = `${CSI}2m`
const UNDERLINE = `${CSI}4m`
const RESET = `${CSI}0m`
const INVERSE = `${CSI}7m`
const FG_CYAN = `${CSI}36m`
const FG_YELLOW = `${CSI}33m`
const FG_GREEN = `${CSI}32m`
const FG_RED = `${CSI}31m`
const FG_GRAY = `${CSI}90m`

function statusColor(status: string): string {
  switch (status) {
    case 'todo': return FG_YELLOW
    case 'in-progress': return FG_CYAN
    case 'done': return FG_GREEN
    case 'closed': return FG_RED
    default: return ''
  }
}

function buildEntries(tasks: TaskData[]): FzfEntry[] {
  return tasks.map((task) => ({
    task,
    searchText: `${task.id} ${task.type} ${task.status} ${task.title} ${task.description}`,
  }))
}

export async function interactiveList(tasks: TaskData[], archivedTasks: TaskData[]): Promise<void> {
  const { stdin, stdout } = process

  const datasets = [
    { label: 'Tasks', entries: buildEntries(tasks) },
    { label: 'Archive', entries: buildEntries(archivedTasks) },
  ]

  let activeTab = 0
  let query = ''
  let selectedIndex = 0
  let scrollOffset = 0

  function getFiltered(): FzfEntry[] {
    const entries = datasets[activeTab].entries
    if (!query) return entries
    const fzf = new Fzf(entries, { selector: (e) => e.searchText })
    return fzf.find(query).map((r) => r.item)
  }

  function getTermSize(): { cols: number; rows: number } {
    return { cols: stdout.columns || 80, rows: stdout.rows || 24 }
  }

  function render(): void {
    const { cols, rows } = getTermSize()
    const filtered = getFiltered()
    const buf: string[] = []

    buf.push(CLEAR_SCREEN)

    // Tab bar
    const tabParts = datasets.map((ds, i) => {
      const label = ` ${ds.label} `
      return i === activeTab ? `${INVERSE}${BOLD}${label}${RESET}` : `${DIM}${label}${RESET}`
    })
    buf.push(`${tabParts.join('  ')}${' '.repeat(Math.max(0, cols - 30))}${FG_GRAY}Tab: switch  Esc: quit${RESET}`)
    buf.push('')

    // Search input
    buf.push(`${FG_CYAN}>${RESET} ${query}${UNDERLINE} ${RESET}`)

    // Separator
    const listWidth = Math.floor(cols * 0.55)
    const previewWidth = cols - listWidth - 3
    buf.push(`${FG_GRAY}${'─'.repeat(listWidth)}┬${'─'.repeat(previewWidth + 2)}${RESET}`)

    // Column headers
    const headerLine = formatRow('ID', 'TYPE', 'STATUS', 'TITLE', listWidth)
    buf.push(`${BOLD}${headerLine}${RESET}${FG_GRAY}│${RESET}${BOLD} Preview${RESET}`)
    buf.push(`${FG_GRAY}${'─'.repeat(listWidth)}┼${'─'.repeat(previewWidth + 2)}${RESET}`)

    // Content area
    const contentRows = rows - 7 // tab + blank + search + 2 separators + header + bottom
    const maxVisible = Math.max(1, contentRows)

    // Clamp selected index
    if (filtered.length === 0) {
      selectedIndex = 0
    } else {
      selectedIndex = Math.min(selectedIndex, filtered.length - 1)
      selectedIndex = Math.max(selectedIndex, 0)
    }

    // Adjust scroll
    if (selectedIndex < scrollOffset) scrollOffset = selectedIndex
    if (selectedIndex >= scrollOffset + maxVisible) scrollOffset = selectedIndex - maxVisible + 1

    // Build preview lines
    const selectedTask = filtered[selectedIndex]?.task
    const previewLines = buildPreviewLines(selectedTask, previewWidth)

    // Render rows
    for (let i = 0; i < maxVisible; i++) {
      const taskIdx = scrollOffset + i
      const entry = filtered[taskIdx]

      let leftPart: string
      if (!entry) {
        leftPart = ' '.repeat(listWidth)
      } else {
        const isSelected = taskIdx === selectedIndex
        const row = formatRow(entry.task.id, entry.task.type, entry.task.status, entry.task.title, listWidth)
        if (isSelected) {
          leftPart = `${INVERSE}${row}${RESET}`
        } else {
          const sc = statusColor(entry.task.status)
          leftPart = colorizeRow(entry.task.id, entry.task.type, entry.task.status, entry.task.title, listWidth, sc)
        }
      }

      const rightPart = previewLines[i] ?? ''
      buf.push(`${leftPart}${FG_GRAY}│${RESET} ${rightPart}`)
    }

    // Bottom bar
    buf.push(`${FG_GRAY}${'─'.repeat(listWidth)}┴${'─'.repeat(previewWidth + 2)}${RESET}`)
    const countInfo = `${filtered.length}/${datasets[activeTab].entries.length}`
    buf.push(`${FG_GRAY}${countInfo} tasks  ↑↓: navigate  Enter: select  Type to search${RESET}`)

    stdout.write(buf.join('\n'))
  }

  function formatRow(id: string, type: string, status: string, title: string, width: number): string {
    const idCol = id.padEnd(14)
    const typeCol = type.padEnd(12)
    const statusCol = status.padEnd(14)
    const usedWidth = 14 + 12 + 14
    const titleWidth = Math.max(1, width - usedWidth)
    const titleCol = title.length > titleWidth ? title.slice(0, titleWidth - 1) + '…' : title.padEnd(titleWidth)
    return `${idCol}${typeCol}${statusCol}${titleCol}`
  }

  function colorizeRow(id: string, type: string, status: string, title: string, width: number, sc: string): string {
    const idCol = id.padEnd(14)
    const typeCol = type.padEnd(12)
    const statusCol = status.padEnd(14)
    const usedWidth = 14 + 12 + 14
    const titleWidth = Math.max(1, width - usedWidth)
    const titleCol = title.length > titleWidth ? title.slice(0, titleWidth - 1) + '…' : title.padEnd(titleWidth)
    return `${FG_CYAN}${idCol}${RESET}${typeCol}${sc}${statusCol}${RESET}${titleCol}`
  }

  function buildPreviewLines(task: TaskData | undefined, width: number): string[] {
    if (!task) return []
    const lines: string[] = []

    lines.push(`${BOLD}${task.id}${RESET} ${FG_GRAY}${task.type}${RESET} ${statusColor(task.status)}${task.status}${RESET}`)
    lines.push(`${BOLD}${task.title}${RESET}`)
    lines.push('')

    if (task.description) {
      lines.push(`${UNDERLINE}Description${RESET}`)
      for (const line of wrapText(task.description, width)) {
        lines.push(line)
      }
      lines.push('')
    }

    if (task.acceptance_criteria.length > 0) {
      lines.push(`${UNDERLINE}Acceptance Criteria${RESET}`)
      for (const ac of task.acceptance_criteria) {
        for (const line of wrapText(`- [ ] ${ac}`, width)) {
          lines.push(line)
        }
      }
    }

    return lines
  }

  function wrapText(text: string, width: number): string[] {
    if (width <= 0) return [text]
    const result: string[] = []
    const words = text.split(' ')
    let current = ''
    for (const word of words) {
      if (current.length + word.length + 1 > width && current.length > 0) {
        result.push(current)
        current = word
      } else {
        current = current ? `${current} ${word}` : word
      }
    }
    if (current) result.push(current)
    return result
  }

  // Setup terminal
  if (stdin.isTTY) stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')
  stdout.write(ALT_SCREEN_ON + CURSOR_HIDE)

  render()

  return new Promise<void>((resolve) => {
    function cleanup(): void {
      stdout.write(CURSOR_SHOW + ALT_SCREEN_OFF)
      if (stdin.isTTY) stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
    }

    function onData(data: string): void {
      const filtered = getFiltered()

      for (let i = 0; i < data.length; i++) {
        const ch = data[i]

        // Escape sequences
        if (ch === ESC) {
          // Arrow keys: ESC [ A/B
          if (data[i + 1] === '[') {
            const arrow = data[i + 2]
            if (arrow === 'A') { // Up
              if (selectedIndex > 0) selectedIndex--
              i += 2
              continue
            }
            if (arrow === 'B') { // Down
              if (selectedIndex < filtered.length - 1) selectedIndex++
              i += 2
              continue
            }
            // Skip other escape sequences
            i += 2
            continue
          }
          // Plain Esc = exit
          cleanup()
          resolve()
          return
        }

        // Ctrl+C
        if (ch === '\x03') {
          cleanup()
          resolve()
          return
        }

        // Tab
        if (ch === '\t') {
          activeTab = (activeTab + 1) % datasets.length
          query = ''
          selectedIndex = 0
          scrollOffset = 0
          continue
        }

        // Enter
        if (ch === '\r' || ch === '\n') {
          cleanup()
          const selected = getFiltered()[selectedIndex]
          if (selected) {
            process.stdout.write(`\nSelected: ${selected.task.id} - ${selected.task.title}\n`)
          }
          resolve()
          return
        }

        // Backspace
        if (ch === '\x7f' || ch === '\b') {
          if (query.length > 0) {
            query = query.slice(0, -1)
            selectedIndex = 0
            scrollOffset = 0
          }
          continue
        }

        // Printable characters
        if (ch >= ' ' && ch <= '~') {
          query += ch
          selectedIndex = 0
          scrollOffset = 0
        }
      }

      render()
    }

    stdin.on('data', onData)

    // Handle resize
    stdout.on('resize', () => render())
  })
}
