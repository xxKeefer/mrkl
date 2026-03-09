import { Fzf } from 'fzf'
import type { TaskData } from '../types.js'
import { groupByEpic, getChildren, getBlockedBy } from '../task.js'
import {
  ESC,
  ALT_SCREEN_ON,
  ALT_SCREEN_OFF,
  CURSOR_HIDE,
  CURSOR_SHOW,
  CLEAR_SCREEN,
  BOLD,
  UNDERLINE,
  RESET,
  INVERSE,
  FG_CYAN,
  FG_YELLOW,
  FG_GREEN,
  FG_RED,
  FG_GRAY,
} from './ansi.js'

interface FzfEntry {
  task: TaskData
  searchText: string
  indent: number
  blocksIndicator: string | null
  blockedByIndicator: string | null
}

function statusColor(status: string): string {
  switch (status) {
    case 'todo':
      return FG_YELLOW
    case 'in-progress':
      return FG_CYAN
    case 'done':
      return FG_GREEN
    case 'closed':
      return FG_RED
    default:
      return ''
  }
}

function buildEntries(tasks: TaskData[]): FzfEntry[] {
  const grouped = groupByEpic(tasks)
  return grouped.map((g) => ({
    task: g.task,
    searchText: `${g.task.id} ${g.task.type} ${g.task.status} ${g.task.title} ${g.task.description} ${g.task.parent ?? ''} ${g.task.blocks?.join(' ') ?? ''}`,
    indent: g.indent,
    blocksIndicator: g.blocksIndicator,
    blockedByIndicator: g.blockedByIndicator,
  }))
}

export async function interactiveList(
  tasks: TaskData[],
  archivedTasks: TaskData[],
): Promise<TaskData | null> {
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
    const fzf = new Fzf(entries, { selector: (e: FzfEntry) => e.searchText })
    return fzf.find(query).map((r: { item: FzfEntry }) => r.item)
  }

  function getTermSize(): { cols: number; rows: number } {
    return { cols: stdout.columns || 80, rows: stdout.rows || 24 }
  }

  function render(): void {
    const { cols, rows } = getTermSize()
    const filtered = getFiltered()
    const buf: string[] = []

    // Tab bar
    const tabParts = datasets.map((ds, i) => {
      if (i === activeTab) {
        return `${FG_CYAN}${BOLD}[${ds.label}]${RESET}`
      }
      return `${FG_GRAY} ${ds.label} ${RESET}`
    })
    buf.push(tabParts.join('  '))
    buf.push('')

    // Search input
    buf.push(`${FG_CYAN}>${RESET} ${query}${UNDERLINE} ${RESET}`)

    // Separator
    const listWidth = Math.floor(cols * 0.55)
    const previewWidth = cols - listWidth - 3
    buf.push(
      `${FG_GRAY}${'─'.repeat(listWidth)}┬${'─'.repeat(previewWidth + 2)}${RESET}`,
    )

    // Column headers
    const headerLine = formatRow('ID', 'TYPE', 'STATUS', 'TITLE', listWidth)
    buf.push(
      `${BOLD}${headerLine}${RESET}${FG_GRAY}│${RESET}${BOLD} Preview${RESET}`,
    )
    buf.push(
      `${FG_GRAY}${'─'.repeat(listWidth)}┼${'─'.repeat(previewWidth + 2)}${RESET}`,
    )

    // Content area
    const contentRows = rows - 9 // tab + blank + search + 2 separators + header + bottom sep + count
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
    if (selectedIndex >= scrollOffset + maxVisible)
      scrollOffset = selectedIndex - maxVisible + 1

    // Build preview lines
    const selectedTask = filtered[selectedIndex]?.task
    const currentTasks = activeTab === 0 ? tasks : archivedTasks
    const previewLines = buildPreviewLines(selectedTask, previewWidth, currentTasks)

    // Render rows
    for (let i = 0; i < maxVisible; i++) {
      const taskIdx = scrollOffset + i
      const entry = filtered[taskIdx]

      let leftPart: string
      if (!entry) {
        leftPart = ' '.repeat(listWidth)
      } else {
        const isSelected = taskIdx === selectedIndex
        const treePrefix = entry.indent === 1 ? '├─' : ''
        const prefixWidth = treePrefix ? 3 : 0
        const rowWidth = listWidth - prefixWidth
        const indicators: string[] = []
        if (entry.blocksIndicator) indicators.push(entry.blocksIndicator)
        if (entry.blockedByIndicator) indicators.push(entry.blockedByIndicator)
        const indicatorSuffix = indicators.length > 0 ? ` ${indicators.join(' ')}` : ''

        const row = formatRow(
          entry.task.id,
          entry.task.type,
          entry.task.status,
          entry.task.title,
          rowWidth,
        )
        if (isSelected) {
          leftPart = `${treePrefix ? `${FG_GRAY}${treePrefix}${RESET}` : ''}${INVERSE}${row}${RESET}${indicatorSuffix ? `${FG_RED}${indicatorSuffix}${RESET}` : ''}`
        } else {
          const sc = statusColor(entry.task.status)
          const coloredRow = colorizeRow(
            entry.task.id,
            entry.task.type,
            entry.task.status,
            entry.task.title,
            rowWidth,
            sc,
          )
          leftPart = `${treePrefix ? `${FG_GRAY}${treePrefix}${RESET}` : ''}${coloredRow}${indicatorSuffix ? `${FG_RED}${indicatorSuffix}${RESET}` : ''}`
        }
      }

      const rightPart = previewLines[i] ?? ''
      buf.push(`${leftPart}${FG_GRAY}│${RESET} ${rightPart}`)
    }

    // Bottom bar
    buf.push(
      `${FG_GRAY}${'─'.repeat(listWidth)}┴${'─'.repeat(previewWidth + 2)}${RESET}`,
    )
    const countInfo = `${filtered.length}/${datasets[activeTab].entries.length}`
    buf.push(
      `${FG_GRAY}${countInfo} tasks  ↑↓: navigate  Tab: switch  Enter: select  Esc: quit  Type to search${RESET}`,
    )

    stdout.write(CLEAR_SCREEN + buf.join('\n'))
  }

  function formatRow(
    id: string,
    type: string,
    status: string,
    title: string,
    width: number,
  ): string {
    const idCol = id.padEnd(14)
    const typeCol = type.padEnd(12)
    const statusCol = status.padEnd(14)
    const usedWidth = 14 + 12 + 14
    const titleWidth = Math.max(1, width - usedWidth)
    const titleCol =
      title.length > titleWidth
        ? title.slice(0, titleWidth - 1) + '…'
        : title.padEnd(titleWidth)
    return `${idCol}${typeCol}${statusCol}${titleCol}`
  }

  function colorizeRow(
    id: string,
    type: string,
    status: string,
    title: string,
    width: number,
    sc: string,
  ): string {
    const idCol = id.padEnd(14)
    const typeCol = type.padEnd(12)
    const statusCol = status.padEnd(14)
    const usedWidth = 14 + 12 + 14
    const titleWidth = Math.max(1, width - usedWidth)
    const titleCol =
      title.length > titleWidth
        ? title.slice(0, titleWidth - 1) + '…'
        : title.padEnd(titleWidth)
    return `${FG_CYAN}${idCol}${RESET}${typeCol}${sc}${statusCol}${RESET}${titleCol}`
  }

  function buildPreviewLines(
    task: TaskData | undefined,
    width: number,
    allTasks: TaskData[],
  ): string[] {
    if (!task) return []
    const lines: string[] = []

    lines.push(
      `${BOLD}${task.id}${RESET} ${FG_GRAY}${task.type}${RESET} ${statusColor(task.status)}${task.status}${RESET}`,
    )
    lines.push(`${BOLD}${task.title}${RESET}`)
    lines.push('')

    if (task.description) {
      lines.push(`${UNDERLINE}Description${RESET}`)
      for (const line of wrapText(task.description, width)) {
        lines.push(line)
      }
      lines.push('')
    }

    // Relationships section
    const children = getChildren(allTasks, task.id)
    const blockedBy = getBlockedBy(allTasks, task.id)
    const hasRelationships = task.parent || children.length > 0 || (task.blocks && task.blocks.length > 0) || blockedBy.length > 0

    if (hasRelationships) {
      lines.push(`${UNDERLINE}Relationships${RESET}`)
      if (task.parent) {
        lines.push(`  Parent: ${FG_CYAN}${task.parent}${RESET}`)
      }
      if (children.length > 0) {
        lines.push(`  Children: ${FG_CYAN}${children.map((c) => c.id).join(', ')}${RESET}`)
      }
      if (task.blocks && task.blocks.length > 0) {
        lines.push(`  Blocks: ${FG_RED}${task.blocks.join(', ')}${RESET}`)
      }
      if (blockedBy.length > 0) {
        lines.push(`  Blocked by: ${FG_RED}${blockedBy.map((t) => t.id).join(', ')}${RESET}`)
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
    for (const rawLine of text.split('\n')) {
      const words = rawLine.split(' ')
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
    }
    return result
  }

  // Setup terminal
  if (stdin.isTTY) stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')
  stdout.write(ALT_SCREEN_ON + CURSOR_HIDE)

  render()

  return new Promise<TaskData | null>((resolve) => {
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
            if (arrow === 'A') {
              // Up
              if (selectedIndex > 0) selectedIndex--
              i += 2
              continue
            }
            if (arrow === 'B') {
              // Down
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
          resolve(null)
          return
        }

        // Ctrl+C
        if (ch === '\x03') {
          cleanup()
          resolve(null)
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
          resolve(selected?.task ?? null)
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
