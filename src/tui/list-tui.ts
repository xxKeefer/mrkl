import { watch, type FSWatcher } from 'node:fs'
import { join } from 'node:path'
import { Fzf } from 'fzf'
import type { TaskData, Priority } from '../types.js'
import { EMOJI, priorityEmoji } from '../emoji.js'
import { groupByEpic, getChildren, getBlockedBy } from '../task.js'
import { TASKS_DIR } from '../id.js'
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

export interface FzfEntry {
  task: TaskData
  searchText: string
  indent: number
  blocksIndicator: string | null
  blockedByIndicator: string | null
  isEpic: boolean
}

export interface ListRenderState {
  activeTab: number
  query: string
  selectedIndex: number
  scrollOffset: number
  datasets: Array<{ label: string; entries: FzfEntry[] }>
  filtered: FzfEntry[]
  allTasks: TaskData[]
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

export function buildEntries(tasks: TaskData[]): FzfEntry[] {
  const parentIds = new Set(tasks.filter((t) => t.parent).map((t) => t.parent!))
  const grouped = groupByEpic(tasks)
  return grouped.map((g) => ({
    task: g.task,
    searchText: `${g.task.id} ${g.task.type} ${g.task.status} ${g.task.title} ${g.task.description} ${g.task.parent ?? ''} ${g.task.blocks?.join(' ') ?? ''}`,
    indent: g.indent,
    blocksIndicator: g.blocksIndicator,
    blockedByIndicator: g.blockedByIndicator,
    isEpic: parentIds.has(g.task.id),
  }))
}

const ID_W = 12
const STATUS_W = 16


function padOrTruncate(text: string, width: number): string {
  if (text.length > width) return text.slice(0, width - 1) + '…'
  return text.padEnd(width)
}

function formatRow(
  id: string,
  status: string,
  title: string,
  width: number,
): string {
  const idCol = padOrTruncate(id, ID_W)
  const statusCol = padOrTruncate(status, STATUS_W)
  const titleWidth = Math.max(0, width - ID_W - STATUS_W)
  const titleCol = padOrTruncate(title, titleWidth)
  return `${idCol}${statusCol}${titleCol}`
}

function colorizeRow(
  id: string,
  status: string,
  title: string,
  width: number,
  sc: string,
): string {
  const idCol = padOrTruncate(id, ID_W)
  const statusCol = padOrTruncate(status, STATUS_W)
  const titleWidth = Math.max(0, width - ID_W - STATUS_W)
  const titleCol = padOrTruncate(title, titleWidth)
  return `${FG_CYAN}${idCol}${RESET}${sc}${statusCol}${RESET}${titleCol}`
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

function buildPreviewLines(
  task: TaskData | undefined,
  width: number,
  allTasks: TaskData[],
): string[] {
  if (!task) return []
  const lines: string[] = []

  const p = (task.priority ?? 3) as Priority
  const children = getChildren(allTasks, task.id)
  const hierarchyEmoji = children.length > 0 ? EMOJI.epic : task.parent ? EMOJI.child : ''
  lines.push(
    `${hierarchyEmoji}${priorityEmoji(p)} ${BOLD}${task.id}${RESET} ${FG_GRAY}${task.type}${RESET} ${statusColor(task.status)}${task.status}${RESET}`,
  )
  lines.push(`${BOLD}${task.title}${RESET}`)
  lines.push('')

  const blockedBy = getBlockedBy(allTasks, task.id)
  const hasRelationships = task.parent || children.length > 0 || (task.blocks && task.blocks.length > 0) || blockedBy.length > 0

  if (hasRelationships) {
    lines.push(`${UNDERLINE}Relationships${RESET}`)
    if (task.parent) {
      lines.push(`  ${EMOJI.epic} Parent: ${FG_CYAN}${task.parent}${RESET}`)
    }
    if (children.length > 0) {
      lines.push(`  ${EMOJI.child} Children: ${FG_CYAN}${children.map((c) => c.id).join(', ')}${RESET}`)
    }
    if (task.blocks && task.blocks.length > 0) {
      lines.push(`  ${EMOJI.blocks} Blocks: ${FG_RED}${task.blocks.join(', ')}${RESET}`)
    }
    if (blockedBy.length > 0) {
      lines.push(`  ${EMOJI.blocked_by} Blocked by: ${FG_RED}${blockedBy.map((t) => t.id).join(', ')}${RESET}`)
    }
    lines.push('')
  }

  if (task.flag) {
    lines.push(`${EMOJI.flag} ${task.flag}`)
    lines.push('')
  }

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

export function renderList(state: ListRenderState, stdout: NodeJS.WriteStream): void {
  const cols = stdout.columns || 80
  const rows = stdout.rows || 24
  const { filtered, datasets } = state
  const buf: string[] = []

  // Tab bar
  const tabParts = datasets.map((ds, i) => {
    if (i === state.activeTab) {
      return `${FG_CYAN}${BOLD}[${ds.label}]${RESET}`
    }
    return `${FG_GRAY} ${ds.label} ${RESET}`
  })
  buf.push(tabParts.join('  '))
  buf.push('')

  // Search input
  buf.push(`${FG_CYAN}>${RESET} ${state.query}${UNDERLINE} ${RESET}`)

  // Separator
  const listWidth = Math.floor(cols * 0.55)
  const previewWidth = cols - listWidth - 3
  buf.push(
    `${FG_GRAY}${'─'.repeat(listWidth)}┬${'─'.repeat(previewWidth + 2)}${RESET}`,
  )

  // Column headers (1-char padding before separator)
  const contentWidth = listWidth - 1
  const headerLine = formatRow('ID', 'STATUS', 'TITLE', contentWidth)
  buf.push(
    `${BOLD}${headerLine}${RESET} ${FG_GRAY}│${RESET}${BOLD} Preview${RESET}`,
  )
  buf.push(
    `${FG_GRAY}${'─'.repeat(listWidth)}┼${'─'.repeat(previewWidth + 2)}${RESET}`,
  )

  // Content area
  const contentRows = rows - 9
  const maxVisible = Math.max(1, contentRows)

  // Clamp selected index
  if (filtered.length === 0) {
    state.selectedIndex = 0
  } else {
    state.selectedIndex = Math.min(state.selectedIndex, filtered.length - 1)
    state.selectedIndex = Math.max(state.selectedIndex, 0)
  }

  // Adjust scroll
  if (state.selectedIndex < state.scrollOffset) state.scrollOffset = state.selectedIndex
  if (state.selectedIndex >= state.scrollOffset + maxVisible)
    state.scrollOffset = state.selectedIndex - maxVisible + 1

  // Build preview lines
  const selectedTask = filtered[state.selectedIndex]?.task
  const previewLines = buildPreviewLines(selectedTask, previewWidth, state.allTasks)

  // Render rows
  for (let i = 0; i < maxVisible; i++) {
    const taskIdx = state.scrollOffset + i
    const entry = filtered[taskIdx]

    let leftPart: string
    if (!entry) {
      leftPart = ' '.repeat(contentWidth) + ' '
    } else {
      const isSelected = taskIdx === state.selectedIndex
      const treePrefix = entry.indent === 1 ? '├─' : ''
      const prefixWidth = treePrefix ? 2 : 0
      const rowWidth = contentWidth - prefixWidth
      const priEmoji = priorityEmoji((entry.task.priority ?? 3) as Priority)
      const blockedByEmoji = entry.blockedByIndicator ? EMOJI.blocked_by : ''
      const blocksEmoji = entry.blocksIndicator ? EMOJI.blocks : ''
      const hierarchyEmoji = entry.isEpic ? EMOJI.epic : entry.task.parent ? EMOJI.child : ''
      const compactStatus = `${entry.task.status} ${hierarchyEmoji}${priEmoji}${blockedByEmoji}${blocksEmoji}`

      if (isSelected) {
        const row = formatRow(
          entry.task.id,
          compactStatus,
          entry.task.title,
          rowWidth,
        )
        leftPart = `${treePrefix ? `${FG_GRAY}${treePrefix}${RESET}` : ''}${INVERSE}${row}${RESET} `
      } else {
        const sc = statusColor(entry.task.status)
        const coloredRow = colorizeRow(
          entry.task.id,
          compactStatus,
          entry.task.title,
          rowWidth,
          sc,
        )
        leftPart = `${treePrefix ? `${FG_GRAY}${treePrefix}${RESET}` : ''}${coloredRow} `
      }
    }

    const rightPart = previewLines[i] ?? ''
    buf.push(`${leftPart}${FG_GRAY}│${RESET} ${rightPart}`)
  }

  // Bottom bar
  buf.push(
    `${FG_GRAY}${'─'.repeat(listWidth)}┴${'─'.repeat(previewWidth + 2)}${RESET}`,
  )
  const countInfo = `${filtered.length}/${datasets[state.activeTab].entries.length}`
  buf.push(
    `${FG_GRAY}${countInfo} tasks  ↑↓: navigate  Tab: switch  Enter: select  Esc: quit  Type to search${RESET}`,
  )

  stdout.write(CLEAR_SCREEN + buf.join('\n'))
}

export type ReloadFn = () => { tasks: TaskData[]; archivedTasks: TaskData[] }

export async function interactiveList(
  tasks: TaskData[],
  archivedTasks: TaskData[],
  onReload?: ReloadFn,
): Promise<TaskData | null> {
  const { stdin, stdout } = process

  const datasets = [
    { label: 'Tasks', entries: buildEntries(tasks) },
    { label: 'Archive', entries: buildEntries(archivedTasks) },
  ]

  let currentTasks = tasks
  let currentArchived = archivedTasks
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

  function render(): void {
    const state: ListRenderState = {
      activeTab,
      query,
      selectedIndex,
      scrollOffset,
      datasets,
      filtered: getFiltered(),
      allTasks: activeTab === 0 ? currentTasks : currentArchived,
    }
    renderList(state, stdout)
    selectedIndex = state.selectedIndex
    scrollOffset = state.scrollOffset
  }

  function reloadFromDisk(): void {
    if (!onReload) return
    const fresh = onReload()
    currentTasks = fresh.tasks
    currentArchived = fresh.archivedTasks
    datasets[0].entries = buildEntries(currentTasks)
    datasets[1].entries = buildEntries(currentArchived)
    const filtered = getFiltered()
    if (selectedIndex >= filtered.length) {
      selectedIndex = Math.max(0, filtered.length - 1)
    }
    render()
  }

  // Setup terminal
  if (stdin.isTTY) stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')
  stdout.write(ALT_SCREEN_ON + CURSOR_HIDE)

  // Set up file watchers for live reload
  const watchers: FSWatcher[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  if (onReload) {
    try {
      const tasksPath = join(process.cwd(), TASKS_DIR)
      const archivePath = join(tasksPath, '.archive')

      const onFsChange = (): void => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(reloadFromDisk, 150)
      }

      try { watchers.push(watch(tasksPath, onFsChange)) } catch { /* dir may not exist */ }
      try { watchers.push(watch(archivePath, onFsChange)) } catch { /* dir may not exist */ }
    } catch { /* config unavailable */ }
  }

  render()

  return new Promise<TaskData | null>((resolve) => {
    function cleanup(): void {
      if (debounceTimer) clearTimeout(debounceTimer)
      for (const w of watchers) w.close()
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
