import { TASK_TYPES, STATUSES, PRIORITIES } from '../types.js'
import type {
  TaskType,
  Status,
  CreateTaskOpts,
  TaskData,
  EditTaskResult,
} from '../types.js'
import { priorityIcon } from '../icons.js'
import {
  ESC,
  ALT_SCREEN_ON,
  ALT_SCREEN_OFF,
  CURSOR_HIDE,
  CURSOR_SHOW,
  CLEAR_SCREEN,
  BOLD,
  DIM,
  RESET,
  INVERSE,
  FG_CYAN,
  FG_RED,
  FG_GRAY,
} from './ansi.js'

const PRIORITY_LABELS = ['lowest', 'low', 'normal', 'high', 'highest'] as const

export interface AutocompleteCandidate {
  id: string
  label: string
}

export function buildParentCandidates(tasks: TaskData[]): AutocompleteCandidate[] {
  return tasks
    .filter((t) => !t.parent)
    .map((t) => ({ id: t.id, label: `${t.id} - ${t.title}` }))
}

function buildBlockCandidates(tasks: TaskData[]): AutocompleteCandidate[] {
  return tasks.map((t) => ({ id: t.id, label: `${t.id} - ${t.title}` }))
}

export function filterCandidates(
  input: string,
  candidates: AutocompleteCandidate[],
  exclude?: Set<string>,
  limit: number = 5,
): AutocompleteCandidate[] {
  let filtered = candidates
  if (exclude) {
    filtered = filtered.filter((c) => !exclude.has(c.id))
  }
  if (input) {
    const lower = input.toLowerCase()
    filtered = filtered.filter((c) => c.label.toLowerCase().includes(lower))
  }
  return filtered.slice(0, limit)
}

export type FormMode = 'create' | 'edit'

const LABEL_WIDTH = 15
// pointer(1) + space(1) + label(LABEL_WIDTH) + space(1)
const GUTTER = 2 + LABEL_WIDTH + 1

export interface FormState {
  type: number
  status: number
  priority: number
  title: string
  description: string
  flag: string
  parent: string
  parentInput: string
  parentCandidates: AutocompleteCandidate[]
  parentHighlight: number
  blocks: string[]
  currentBlock: string
  blockCandidates: AutocompleteCandidate[]
  blockHighlight: number
  criteria: string[]
  currentCriterion: string
  activeField: number
  cursorPos: number
  error: string
  mode: FormMode
  taskId?: string
}

// Field layout:
// create: 0=type, 1=priority, 2=title, 3=description, 4=flag, 5=parent, 6..M=block entries, M+1=+Block, M+2..N=criteria, N+1=+Add
// edit:   0=type, 1=status, 2=priority, 3=title, 4=description, 5=flag, 6=parent, 7..M=block entries, M+1=+Block, M+2..N=criteria, N+1=+Add

function priorityFieldIndex(state: FormState): number {
  return state.mode === 'edit' ? 2 : 1
}

function titleFieldIndex(state: FormState): number {
  return state.mode === 'edit' ? 3 : 2
}

function descFieldIndex(state: FormState): number {
  return state.mode === 'edit' ? 4 : 3
}

function flagFieldIndex(state: FormState): number {
  return descFieldIndex(state) + 1
}

function parentFieldIndex(state: FormState): number {
  return flagFieldIndex(state) + 1
}

function blocksStartIndex(state: FormState): number {
  return parentFieldIndex(state) + 1
}

function blocksAddIndex(state: FormState): number {
  return blocksStartIndex(state) + state.blocks.length
}

function criteriaStartIndex(state: FormState): number {
  return blocksAddIndex(state) + 1
}

function totalFields(state: FormState): number {
  return criteriaStartIndex(state) + state.criteria.length + 1
}

function clampField(state: FormState): void {
  const max = totalFields(state) - 1
  if (state.activeField < 0) state.activeField = 0
  if (state.activeField > max) state.activeField = max
}

function isTypeField(state: FormState): boolean {
  return state.activeField === 0
}

function isStatusField(state: FormState): boolean {
  return state.mode === 'edit' && state.activeField === 1
}

function isPriorityField(state: FormState): boolean {
  return state.activeField === priorityFieldIndex(state)
}

function isCycleField(state: FormState): boolean {
  return isTypeField(state) || isStatusField(state) || isPriorityField(state)
}

function isTextField(state: FormState): boolean {
  return state.activeField >= titleFieldIndex(state)
}

function isAutocompleteField(state: FormState): boolean {
  return state.activeField === parentFieldIndex(state) ||
    state.activeField === blocksAddIndex(state)
}

function isParentField(state: FormState): boolean {
  return state.activeField === parentFieldIndex(state)
}

function isBlocksAddField(state: FormState): boolean {
  return state.activeField === blocksAddIndex(state)
}

function isBlockEntryField(state: FormState): boolean {
  const start = blocksStartIndex(state)
  return state.activeField >= start && state.activeField < start + state.blocks.length
}

function getCurrentText(state: FormState): string {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const flagIdx = flagFieldIndex(state)
  const parentIdx = parentFieldIndex(state)
  const blkStart = blocksStartIndex(state)
  const blkAddIdx = blocksAddIndex(state)
  const critStart = criteriaStartIndex(state)

  if (state.activeField === titleIdx) return state.title
  if (state.activeField === descIdx) return state.description
  if (state.activeField === flagIdx) return state.flag
  if (state.activeField === parentIdx) return state.parentInput
  if (state.activeField >= blkStart && state.activeField < blkStart + state.blocks.length) {
    return state.blocks[state.activeField - blkStart]
  }
  if (state.activeField === blkAddIdx) return state.currentBlock
  if (state.activeField >= critStart && state.activeField < critStart + state.criteria.length) {
    return state.criteria[state.activeField - critStart]
  }
  if (state.activeField === critStart + state.criteria.length) return state.currentCriterion
  return ''
}

function setCurrentText(state: FormState, text: string): void {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const flagIdx = flagFieldIndex(state)
  const parentIdx = parentFieldIndex(state)
  const blkStart = blocksStartIndex(state)
  const blkAddIdx = blocksAddIndex(state)
  const critStart = criteriaStartIndex(state)

  if (state.activeField === titleIdx) { state.title = text; return }
  if (state.activeField === descIdx) { state.description = text; return }
  if (state.activeField === flagIdx) { state.flag = text; return }
  if (state.activeField === parentIdx) {
    state.parentInput = text
    state.parentHighlight = 0
    return
  }
  if (state.activeField >= blkStart && state.activeField < blkStart + state.blocks.length) {
    state.blocks[state.activeField - blkStart] = text
    return
  }
  if (state.activeField === blkAddIdx) {
    state.currentBlock = text
    state.blockHighlight = 0
    return
  }
  if (state.activeField >= critStart && state.activeField < critStart + state.criteria.length) {
    state.criteria[state.activeField - critStart] = text
    return
  }
  if (state.activeField === critStart + state.criteria.length) {
    state.currentCriterion = text
    return
  }
}

function getTextForField(state: FormState, fieldIndex: number): string {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const flagIdx = flagFieldIndex(state)
  const parentIdx = parentFieldIndex(state)
  const blkStart = blocksStartIndex(state)
  const blkAddIdx = blocksAddIndex(state)
  const critStart = criteriaStartIndex(state)

  if (fieldIndex === titleIdx) return state.title
  if (fieldIndex === descIdx) return state.description
  if (fieldIndex === flagIdx) return state.flag
  if (fieldIndex === parentIdx) return state.parentInput
  if (fieldIndex >= blkStart && fieldIndex < blkStart + state.blocks.length) {
    return state.blocks[fieldIndex - blkStart]
  }
  if (fieldIndex === blkAddIdx) return state.currentBlock
  if (fieldIndex >= critStart && fieldIndex < critStart + state.criteria.length) {
    return state.criteria[fieldIndex - critStart]
  }
  if (fieldIndex === critStart + state.criteria.length) return state.currentCriterion
  return ''
}

interface FieldInfo {
  label: string
  index: number
  kind: 'cycle' | 'text' | 'autocomplete'
}

function buildFieldList(state: FormState): FieldInfo[] {
  const blkStart = blocksStartIndex(state)
  const blkAddIdx = blocksAddIndex(state)
  const critStart = criteriaStartIndex(state)

  const fields: FieldInfo[] = [{ label: 'Type', index: 0, kind: 'cycle' }]
  if (state.mode === 'edit') {
    fields.push({ label: 'Status', index: 1, kind: 'cycle' })
  }
  fields.push({ label: 'Priority', index: priorityFieldIndex(state), kind: 'cycle' })
  fields.push({ label: 'Title', index: titleFieldIndex(state), kind: 'text' })
  fields.push({ label: 'Description', index: descFieldIndex(state), kind: 'text' })
  fields.push({ label: 'Flag', index: flagFieldIndex(state), kind: 'text' })
  fields.push({ label: 'Parent', index: parentFieldIndex(state), kind: 'autocomplete' })

  for (let i = 0; i < state.blocks.length; i++) {
    fields.push({ label: `Blocks ${i + 1}`, index: blkStart + i, kind: 'text' })
  }
  fields.push({ label: '+ Block', index: blkAddIdx, kind: 'autocomplete' })

  for (let i = 0; i < state.criteria.length; i++) {
    fields.push({ label: `Criterion ${i + 1}`, index: critStart + i, kind: 'text' })
  }
  fields.push({ label: '+ Add', index: critStart + state.criteria.length, kind: 'text' })

  return fields
}

/**
 * Split text into visual lines, respecting hard newlines and soft wrapping.
 * When cursorPos is provided, returns cursor position within the visual lines.
 */
function textToVisualLines(
  text: string,
  contentWidth: number,
  cursorPos: number | null,
): { lines: string[]; cursorLine: number; cursorCol: number } {
  const lines: string[] = []
  let cursorLine = -1
  let cursorCol = -1
  let flatIdx = 0

  const logicalLines = text.split('\n')
  for (let li = 0; li < logicalLines.length; li++) {
    const logical = logicalLines[li]

    if (logical.length === 0) {
      if (cursorPos !== null && flatIdx === cursorPos) {
        cursorLine = lines.length
        cursorCol = 0
      }
      lines.push('')
      flatIdx++
      continue
    }

    let offset = 0
    while (offset < logical.length) {
      const chunk = logical.slice(offset, offset + contentWidth)
      const visualLineIdx = lines.length

      if (cursorPos !== null && cursorLine < 0) {
        const chunkStart = flatIdx + offset
        const chunkEnd = chunkStart + chunk.length
        if (cursorPos >= chunkStart && cursorPos < chunkEnd) {
          cursorLine = visualLineIdx
          cursorCol = cursorPos - chunkStart
        }
      }

      lines.push(chunk)
      offset += chunk.length
    }

    flatIdx += logical.length
    if (li < logicalLines.length - 1) {
      if (cursorPos !== null && cursorLine < 0 && cursorPos === flatIdx) {
        cursorLine = lines.length
        cursorCol = 0
      }
      flatIdx++
    }
  }

  if (cursorPos !== null && cursorLine < 0) {
    const lastIdx = lines.length - 1
    cursorLine = lastIdx >= 0 ? lastIdx : 0
    cursorCol = lastIdx >= 0 ? lines[lastIdx].length : 0
  }

  if (lines.length === 0) lines.push('')

  return { lines, cursorLine, cursorCol }
}

function getFilteredSuggestions(state: FormState): AutocompleteCandidate[] {
  if (isParentField(state)) {
    return filterCandidates(state.parentInput, state.parentCandidates)
  }
  if (isBlocksAddField(state)) {
    return filterCandidates(
      state.currentBlock,
      state.blockCandidates,
      new Set(state.blocks),
    )
  }
  return []
}

const MIN_COLS = 40

export function render(state: FormState, stdout: NodeJS.WriteStream): void {
  const cols = stdout.columns || 80
  const rows = (stdout.rows || 24)

  if (cols < MIN_COLS) {
    stdout.write(CLEAR_SCREEN)
    const msg = 'Terminal too small'
    const hint = `Need ${MIN_COLS}+ cols (have ${cols})`
    const y = Math.floor(rows / 2)
    const x1 = Math.max(0, Math.floor((cols - msg.length) / 2))
    const x2 = Math.max(0, Math.floor((cols - hint.length) / 2))
    stdout.write(`\x1B[${y};${x1 + 1}H${BOLD}${msg}${RESET}`)
    stdout.write(`\x1B[${y + 1};${x2 + 1}H${DIM}${hint}${RESET}`)
    return
  }

  const contentWidth = Math.max(10, cols - GUTTER - 2)
  const sepWidth = Math.min(cols - 4, 60)
  const buf: string[] = []

  buf.push('')
  const header =
    state.mode === 'edit'
      ? `Edit Task ${state.taskId ?? ''}`
      : 'Create Task'
  buf.push(`  ${BOLD}${header}${RESET}`)
  buf.push(`  ${FG_GRAY}${'─'.repeat(sepWidth)}${RESET}`)

  if (state.error) {
    buf.push(`  ${FG_RED}${state.error}${RESET}`)
  }

  const fields = buildFieldList(state)
  const pad = ' '.repeat(GUTTER)

  for (const f of fields) {
    const active = f.index === state.activeField
    const pointer = active ? `${FG_CYAN}›${RESET}` : ' '
    const labelColor = active ? FG_CYAN : DIM
    const label = `${labelColor}${f.label.padEnd(LABEL_WIDTH)}${RESET}`

    if (f.kind === 'cycle') {
      let value: string
      if (f.index === priorityFieldIndex(state)) {
        const p = PRIORITIES[state.priority]
        value = `${priorityIcon(p)} ${p}-${PRIORITY_LABELS[state.priority]}`
      } else if (f.index === 0) {
        value = TASK_TYPES[state.type]
      } else {
        value = STATUSES[state.status]
      }
      const display = active
        ? `${FG_CYAN}◂ ${BOLD}${value}${RESET}${FG_CYAN} ▸${RESET}`
        : `  ${value}`
      buf.push(`${pointer} ${label} ${display}`)
    } else {
      const text = getTextForField(state, f.index)

      if (active) {
        const { lines, cursorLine, cursorCol } = textToVisualLines(
          text,
          contentWidth,
          state.cursorPos,
        )

        for (let li = 0; li < lines.length; li++) {
          const lineText = lines[li]
          const prefix = li === 0 ? `${pointer} ${label} ` : pad

          if (li === cursorLine) {
            const before = lineText.slice(0, cursorCol)
            const cursorChar = lineText[cursorCol] ?? ' '
            const after = lineText.slice(cursorCol + 1)
            buf.push(
              `${prefix}${before}${INVERSE}${cursorChar}${RESET}${after}`,
            )
          } else {
            buf.push(`${prefix}${lineText}`)
          }
        }

        // Render autocomplete dropdown for active autocomplete fields
        if (f.kind === 'autocomplete') {
          const suggestions = getFilteredSuggestions(state)
          const highlight = isParentField(state) ? state.parentHighlight : state.blockHighlight
          for (let si = 0; si < suggestions.length; si++) {
            const arrow = si === highlight ? '→' : ' '
            const style = si === highlight ? `${FG_CYAN}${BOLD}` : FG_GRAY
            buf.push(`${pad}  ${arrow} ${style}${suggestions[si].label}${RESET}`)
          }
        }
      } else {
        if (text) {
          const { lines } = textToVisualLines(text, contentWidth, null)
          for (let li = 0; li < lines.length; li++) {
            const prefix = li === 0 ? `${pointer} ${label} ` : pad
            buf.push(`${prefix}${lines[li]}`)
          }
        } else {
          const placeholder = f.kind === 'autocomplete'
            ? 'type to search...'
            : '·'.repeat(Math.min(20, contentWidth))
          buf.push(
            `${pointer} ${label} ${FG_GRAY}${placeholder}${RESET}`,
          )
        }
      }
    }
  }

  buf.push(`  ${FG_GRAY}${'─'.repeat(sepWidth)}${RESET}`)
  const cycleHint =
    state.mode === 'edit' ? '←→ cycle type/status/priority' : '←→ cycle type/priority'
  buf.push(
    `  ${FG_GRAY}↑↓ navigate  ${cycleHint}  Ctrl+N newline  Enter submit  Esc quit${RESET}`,
  )
  buf.push('')

  stdout.write(CLEAR_SCREEN + buf.join('\n'))
}

interface FormOptions {
  mode: FormMode
  taskId?: string
  tasks?: TaskData[]
  initialValues?: {
    type?: number
    status?: number
    priority?: number
    title?: string
    description?: string
    flag?: string
    parent?: string
    blocks?: string[]
    criteria?: string[]
  }
}

function runForm<T>(
  opts: FormOptions,
  buildResult: (state: FormState) => T,
): Promise<T | null> {
  const { stdin, stdout } = process

  const init = opts.initialValues ?? {}
  const tasks = opts.tasks ?? []

  const parentCandidates = buildParentCandidates(tasks)
  const blockCandidates = buildBlockCandidates(tasks)

  // Resolve initial parent display text
  const initialParentInput = init.parent
    ? (parentCandidates.find((c) => c.id === init.parent)?.label ?? init.parent)
    : ''

  const state: FormState = {
    type: init.type ?? 0,
    status: init.status ?? 0,
    priority: init.priority ?? 2,
    title: init.title ?? '',
    description: init.description ?? '',
    flag: init.flag ?? '',
    parent: init.parent ?? '',
    parentInput: initialParentInput,
    parentCandidates,
    parentHighlight: 0,
    blocks: init.blocks ? [...init.blocks] : [],
    currentBlock: '',
    blockCandidates,
    blockHighlight: 0,
    criteria: init.criteria ? [...init.criteria] : [],
    currentCriterion: '',
    activeField: 0,
    cursorPos: 0,
    error: '',
    mode: opts.mode,
    taskId: opts.taskId,
  }

  if (stdin.isTTY) stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')
  stdout.write(ALT_SCREEN_ON + CURSOR_HIDE)

  render(state, stdout)

  return new Promise<T | null>((resolve) => {
    function cleanup(): void {
      stdout.write(CURSOR_SHOW + ALT_SCREEN_OFF)
      if (stdin.isTTY) stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
    }

    function moveToField(index: number): void {
      state.activeField = index
      clampField(state)
      if (isTextField(state)) {
        state.cursorPos = getCurrentText(state).length
      }
    }

    function submit(): void {
      if (!state.title.trim()) {
        state.error = 'Title cannot be empty'
        moveToField(titleFieldIndex(state))
        render(state, stdout)
        return
      }
      state.error = ''
      cleanup()
      resolve(buildResult(state))
    }

    function insertChar(ch: string): void {
      if (!isTextField(state)) return
      state.error = ''
      const text = getCurrentText(state)
      const newText =
        text.slice(0, state.cursorPos) + ch + text.slice(state.cursorPos)
      setCurrentText(state, newText)
      state.cursorPos += ch.length
    }

    function handleAutocompleteEnter(): boolean {
      if (isParentField(state)) {
        if (state.parentInput.trim() === '') {
          state.parent = ''
          moveToField(state.activeField + 1)
          return true
        }
        const suggestions = getFilteredSuggestions(state)
        if (state.parentHighlight >= 0 && state.parentHighlight < suggestions.length) {
          const selected = suggestions[state.parentHighlight]
          state.parent = selected.id
          state.parentInput = selected.label
          state.cursorPos = selected.label.length
        } else {
          state.parent = state.parentInput.trim()
        }
        moveToField(state.activeField + 1)
        return true
      }

      if (isBlocksAddField(state)) {
        if (state.currentBlock.trim() === '') {
          // Empty input on +Block = advance to criteria +Add field
          moveToField(criteriaStartIndex(state) + state.criteria.length)
          return true
        }
        const suggestions = getFilteredSuggestions(state)
        if (state.blockHighlight >= 0 && state.blockHighlight < suggestions.length) {
          state.blocks.push(suggestions[state.blockHighlight].id)
          state.currentBlock = ''
          state.blockHighlight = 0
          state.activeField = blocksAddIndex(state)
          state.cursorPos = 0
          return true
        }
        // Non-empty text but no highlight match — use raw text as ID
        state.blocks.push(state.currentBlock.trim())
        state.currentBlock = ''
        state.blockHighlight = 0
        state.activeField = blocksAddIndex(state)
        state.cursorPos = 0
        return true
      }

      return false
    }

    function cycleHighlight(direction: 1 | -1): boolean {
      if (isParentField(state)) {
        const suggestions = getFilteredSuggestions(state)
        if (suggestions.length > 0) {
          state.parentHighlight = (state.parentHighlight + direction + suggestions.length) % suggestions.length
        }
        return true
      }
      if (isBlocksAddField(state)) {
        const suggestions = getFilteredSuggestions(state)
        if (suggestions.length > 0) {
          state.blockHighlight = (state.blockHighlight + direction + suggestions.length) % suggestions.length
        }
        return true
      }
      return false
    }

    function onData(data: string): void {
      const critStart = criteriaStartIndex(state)
      const blkStart = blocksStartIndex(state)

      for (let i = 0; i < data.length; i++) {
        const ch = data[i]

        if (ch === ESC) {
          // Alt+Enter: ESC followed by \r or \n — insert newline
          if (
            (data[i + 1] === '\r' || data[i + 1] === '\n') &&
            isTextField(state) &&
            !isAutocompleteField(state)
          ) {
            insertChar('\n')
            i += 1
            continue
          }

          // CSI 27;{mod};13~ — xterm modifyOtherKeys Enter sequences
          if (
            data.slice(i + 1, i + 7) === '[27;2~' ||
            data.slice(i + 1, i + 9) === '[27;2;13~'
          ) {
            if (isTextField(state) && !isAutocompleteField(state)) insertChar('\n')
            const tilde = data.indexOf('~', i + 1)
            i = tilde >= 0 ? tilde : i + 6
            continue
          }

          if (data[i + 1] === '[') {
            const arrow = data[i + 2]
            // Shift+Tab (CSI Z)
            if (arrow === 'Z') {
              moveToField(state.activeField - 1)
              i += 2
              continue
            }
            if (arrow === 'A') {
              moveToField(state.activeField - 1)
              i += 2
              continue
            }
            if (arrow === 'B') {
              moveToField(state.activeField + 1)
              i += 2
              continue
            }
            if (arrow === 'C') {
              if (isAutocompleteField(state)) {
                cycleHighlight(1)
              } else if (isTypeField(state)) {
                state.type = (state.type + 1) % TASK_TYPES.length
              } else if (isStatusField(state)) {
                state.status = (state.status + 1) % STATUSES.length
              } else if (isPriorityField(state)) {
                state.priority = (state.priority + 1) % PRIORITIES.length
              } else if (isTextField(state)) {
                const text = getCurrentText(state)
                if (state.cursorPos < text.length) state.cursorPos++
              }
              i += 2
              continue
            }
            if (arrow === 'D') {
              if (isAutocompleteField(state)) {
                cycleHighlight(-1)
              } else if (isTypeField(state)) {
                state.type =
                  (state.type - 1 + TASK_TYPES.length) % TASK_TYPES.length
              } else if (isStatusField(state)) {
                state.status =
                  (state.status - 1 + STATUSES.length) % STATUSES.length
              } else if (isPriorityField(state)) {
                state.priority =
                  (state.priority - 1 + PRIORITIES.length) % PRIORITIES.length
              } else if (isTextField(state)) {
                if (state.cursorPos > 0) state.cursorPos--
              }
              i += 2
              continue
            }
            i += 2
            continue
          }
          // Plain Esc = cancel
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

        // Tab — move to next field
        if (ch === '\t') {
          moveToField(state.activeField + 1)
          render(state, stdout)
          continue
        }

        // Ctrl+N — insert newline (reliable cross-terminal fallback)
        if (ch === '\x0e') {
          if (isTextField(state) && !isAutocompleteField(state)) insertChar('\n')
          continue
        }

        // Enter
        if (ch === '\r' || ch === '\n') {
          if (isCycleField(state)) {
            moveToField(state.activeField + 1)
            continue
          }

          if (handleAutocompleteEnter()) {
            render(state, stdout)
            continue
          }

          const newCriterionField = critStart + state.criteria.length
          if (state.activeField === newCriterionField) {
            if (state.currentCriterion.trim()) {
              state.criteria.push(state.currentCriterion.trim())
              state.currentCriterion = ''
              state.activeField = criteriaStartIndex(state) + state.criteria.length
              state.cursorPos = 0
            } else {
              submit()
              return
            }
          } else {
            moveToField(state.activeField + 1)
          }
          continue
        }

        // Backspace
        if (ch === '\x7f' || ch === '\b') {
          if (isTextField(state)) {
            const text = getCurrentText(state)

            // Delete empty block entry
            if (isBlockEntryField(state) && text.length === 0) {
              const blockIndex = state.activeField - blkStart
              state.blocks.splice(blockIndex, 1)
              moveToField(state.activeField - 1)
              continue
            }

            // Delete empty criterion entry
            if (
              state.activeField >= critStart &&
              state.activeField < critStart + state.criteria.length &&
              text.length === 0
            ) {
              const criterionIndex = state.activeField - critStart
              state.criteria.splice(criterionIndex, 1)
              moveToField(state.activeField - 1)
              continue
            }

            if (state.cursorPos > 0) {
              const newText =
                text.slice(0, state.cursorPos - 1) +
                text.slice(state.cursorPos)
              setCurrentText(state, newText)
              state.cursorPos--
            }
          }
          continue
        }

        // Printable characters
        if (ch >= ' ' && ch <= '~') {
          insertChar(ch)
        }
      }

      render(state, stdout)
    }

    stdin.on('data', onData)
    stdout.on('resize', () => render(state, stdout))
  })
}

export async function interactiveCreate(
  tasks: TaskData[] = [],
): Promise<Omit<CreateTaskOpts, 'dir'> | null> {
  return runForm<Omit<CreateTaskOpts, 'dir'>>(
    { mode: 'create', tasks },
    (state) => {
      const criteria = [...state.criteria]
      if (state.currentCriterion.trim()) {
        criteria.push(state.currentCriterion.trim())
      }
      const priority = PRIORITIES[state.priority]
      return {
        type: TASK_TYPES[state.type] as TaskType,
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        acceptance_criteria: criteria.length > 0 ? criteria : undefined,
        priority,
        flag: state.flag.trim() || undefined,
        parent: state.parent || undefined,
        blocks: state.blocks.length > 0 ? [...state.blocks] : undefined,
      }
    },
  )
}

export async function interactiveEdit(
  task: TaskData,
  tasks: TaskData[] = [],
): Promise<EditTaskResult | null> {
  const typeIndex = TASK_TYPES.indexOf(task.type)
  const statusIndex = STATUSES.indexOf(task.status)

  return runForm<EditTaskResult>(
    {
      mode: 'edit',
      taskId: task.id,
      tasks,
      initialValues: {
        type: typeIndex >= 0 ? typeIndex : 0,
        status: statusIndex >= 0 ? statusIndex : 0,
        priority: task.priority ? PRIORITIES.indexOf(task.priority) : 2,
        title: task.title,
        description: task.description,
        flag: task.flag,
        parent: task.parent,
        blocks: task.blocks,
        criteria: [...task.acceptance_criteria],
      },
    },
    (state) => {
      const criteria = [...state.criteria]
      if (state.currentCriterion.trim()) {
        criteria.push(state.currentCriterion.trim())
      }
      const priority = PRIORITIES[state.priority]
      return {
        type: TASK_TYPES[state.type] as TaskType,
        status: STATUSES[state.status] as Status,
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        acceptance_criteria: criteria.length > 0 ? criteria : undefined,
        priority,
        flag: state.flag.trim() || undefined,
        parent: state.parent || '',
        blocks: [...state.blocks],
      }
    },
  )
}
