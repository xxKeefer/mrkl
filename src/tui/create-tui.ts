import { TASK_TYPES, STATUSES } from '../types.js'
import type {
  TaskType,
  Status,
  CreateTaskOpts,
  TaskData,
  EditTaskResult,
} from '../types.js'
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

type FormMode = 'create' | 'edit'

const LABEL_WIDTH = 15
// pointer(1) + space(1) + label(LABEL_WIDTH) + space(1)
const GUTTER = 2 + LABEL_WIDTH + 1

interface FormState {
  type: number
  status: number
  title: string
  description: string
  criteria: string[]
  currentCriterion: string
  activeField: number
  cursorPos: number
  error: string
  mode: FormMode
  taskId?: string
}

// Field indices differ by mode:
// create: 0=type, 1=title, 2=description, 3..N=criteria, N+1=new criterion
// edit:   0=type, 1=status, 2=title, 3=description, 4..N=criteria, N+1=new criterion

function titleFieldIndex(state: FormState): number {
  return state.mode === 'edit' ? 2 : 1
}

function descFieldIndex(state: FormState): number {
  return state.mode === 'edit' ? 3 : 2
}

function criteriaStartIndex(state: FormState): number {
  return state.mode === 'edit' ? 4 : 3
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

function isCycleField(state: FormState): boolean {
  return isTypeField(state) || isStatusField(state)
}

function isTextField(state: FormState): boolean {
  return state.activeField >= titleFieldIndex(state)
}

function getCurrentText(state: FormState): string {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const critStart = criteriaStartIndex(state)

  if (state.activeField === titleIdx) return state.title
  if (state.activeField === descIdx) return state.description
  if (
    state.activeField >= critStart &&
    state.activeField < critStart + state.criteria.length
  ) {
    return state.criteria[state.activeField - critStart]
  }
  if (state.activeField === critStart + state.criteria.length)
    return state.currentCriterion
  return ''
}

function setCurrentText(state: FormState, text: string): void {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const critStart = criteriaStartIndex(state)

  if (state.activeField === titleIdx) {
    state.title = text
    return
  }
  if (state.activeField === descIdx) {
    state.description = text
    return
  }
  if (
    state.activeField >= critStart &&
    state.activeField < critStart + state.criteria.length
  ) {
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
  const critStart = criteriaStartIndex(state)

  if (fieldIndex === titleIdx) return state.title
  if (fieldIndex === descIdx) return state.description
  if (
    fieldIndex >= critStart &&
    fieldIndex < critStart + state.criteria.length
  ) {
    return state.criteria[fieldIndex - critStart]
  }
  if (fieldIndex === critStart + state.criteria.length)
    return state.currentCriterion
  return ''
}

interface FieldInfo {
  label: string
  index: number
  kind: 'cycle' | 'text'
}

function buildFieldList(state: FormState): FieldInfo[] {
  const critStart = criteriaStartIndex(state)
  const fields: FieldInfo[] = [{ label: 'Type', index: 0, kind: 'cycle' }]
  if (state.mode === 'edit') {
    fields.push({ label: 'Status', index: 1, kind: 'cycle' })
  }
  fields.push({
    label: 'Title',
    index: titleFieldIndex(state),
    kind: 'text',
  })
  fields.push({
    label: 'Description',
    index: descFieldIndex(state),
    kind: 'text',
  })
  for (let i = 0; i < state.criteria.length; i++) {
    fields.push({
      label: `Criterion ${i + 1}`,
      index: critStart + i,
      kind: 'text',
    })
  }
  fields.push({
    label: '+ Add',
    index: critStart + state.criteria.length,
    kind: 'text',
  })
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
      // Empty logical line
      if (cursorPos !== null && flatIdx === cursorPos) {
        cursorLine = lines.length
        cursorCol = 0
      }
      lines.push('')
      flatIdx++ // account for the \n (or end of string)
      continue
    }

    // Wrap this logical line into visual chunks
    let offset = 0
    while (offset < logical.length) {
      const chunk = logical.slice(offset, offset + contentWidth)
      const visualLineIdx = lines.length

      // Check if cursor falls within this chunk
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
    // Account for the \n between logical lines (not after the last one)
    if (li < logicalLines.length - 1) {
      // Cursor might be on the \n character itself (shows at start of next line)
      if (cursorPos !== null && cursorLine < 0 && cursorPos === flatIdx) {
        cursorLine = lines.length // will be the next line added
        cursorCol = 0
      }
      flatIdx++
    }
  }

  // Cursor at the very end of text
  if (cursorPos !== null && cursorLine < 0) {
    const lastIdx = lines.length - 1
    cursorLine = lastIdx >= 0 ? lastIdx : 0
    cursorCol = lastIdx >= 0 ? lines[lastIdx].length : 0
  }

  if (lines.length === 0) lines.push('')

  return { lines, cursorLine, cursorCol }
}

function render(state: FormState, stdout: NodeJS.WriteStream): void {
  const cols = stdout.columns || 80
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
      const items: readonly string[] =
        f.index === 0 ? TASK_TYPES : STATUSES
      const stateIndex = f.index === 0 ? state.type : state.status
      const value = items[stateIndex]
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
      } else {
        if (text) {
          const { lines } = textToVisualLines(text, contentWidth, null)
          for (let li = 0; li < lines.length; li++) {
            const prefix = li === 0 ? `${pointer} ${label} ` : pad
            buf.push(`${prefix}${lines[li]}`)
          }
        } else {
          buf.push(
            `${pointer} ${label} ${FG_GRAY}${'·'.repeat(Math.min(20, contentWidth))}${RESET}`,
          )
        }
      }
    }
  }

  buf.push(`  ${FG_GRAY}${'─'.repeat(sepWidth)}${RESET}`)
  const cycleHint =
    state.mode === 'edit' ? '←→ cycle type/status' : '←→ cycle type'
  buf.push(
    `  ${FG_GRAY}↑↓ navigate  ${cycleHint}  Ctrl+N newline  Enter submit  Esc quit${RESET}`,
  )
  buf.push('')

  stdout.write(CLEAR_SCREEN + buf.join('\n'))
}

interface FormOptions {
  mode: FormMode
  taskId?: string
  initialValues?: {
    type?: number
    status?: number
    title?: string
    description?: string
    criteria?: string[]
  }
}

function runForm<T>(
  opts: FormOptions,
  buildResult: (state: FormState) => T,
): Promise<T | null> {
  const { stdin, stdout } = process

  const init = opts.initialValues ?? {}
  const state: FormState = {
    type: init.type ?? 0,
    status: init.status ?? 0,
    title: init.title ?? '',
    description: init.description ?? '',
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

    function onData(data: string): void {
      const critStart = criteriaStartIndex(state)

      for (let i = 0; i < data.length; i++) {
        const ch = data[i]

        if (ch === ESC) {
          // Alt+Enter: ESC followed by \r or \n — insert newline
          if (
            (data[i + 1] === '\r' || data[i + 1] === '\n') &&
            isTextField(state)
          ) {
            insertChar('\n')
            i += 1
            continue
          }

          // CSI 27;{mod};13~ — xterm modifyOtherKeys Enter sequences
          // Matches Shift+Enter, Ctrl+Enter, etc. in modern terminals
          if (
            data.slice(i + 1, i + 7) === '[27;2~' ||
            data.slice(i + 1, i + 9) === '[27;2;13~'
          ) {
            if (isTextField(state)) insertChar('\n')
            // skip rest of sequence
            const tilde = data.indexOf('~', i + 1)
            i = tilde >= 0 ? tilde : i + 6
            continue
          }

          if (data[i + 1] === '[') {
            const arrow = data[i + 2]
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
              if (isTypeField(state)) {
                state.type = (state.type + 1) % TASK_TYPES.length
              } else if (isStatusField(state)) {
                state.status = (state.status + 1) % STATUSES.length
              } else if (isTextField(state)) {
                const text = getCurrentText(state)
                if (state.cursorPos < text.length) state.cursorPos++
              }
              i += 2
              continue
            }
            if (arrow === 'D') {
              if (isTypeField(state)) {
                state.type =
                  (state.type - 1 + TASK_TYPES.length) % TASK_TYPES.length
              } else if (isStatusField(state)) {
                state.status =
                  (state.status - 1 + STATUSES.length) % STATUSES.length
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

        // Ctrl+N — insert newline (reliable cross-terminal fallback)
        if (ch === '\x0e') {
          if (isTextField(state)) insertChar('\n')
          continue
        }

        // Enter
        if (ch === '\r' || ch === '\n') {
          if (isCycleField(state)) {
            moveToField(state.activeField + 1)
            continue
          }
          const newCriterionField = critStart + state.criteria.length
          if (state.activeField === newCriterionField) {
            if (state.currentCriterion.trim()) {
              state.criteria.push(state.currentCriterion.trim())
              state.currentCriterion = ''
              state.activeField = critStart + state.criteria.length
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

export async function interactiveCreate(): Promise<Omit<
  CreateTaskOpts,
  'dir'
> | null> {
  return runForm<Omit<CreateTaskOpts, 'dir'>>({ mode: 'create' }, (state) => {
    const criteria = [...state.criteria]
    if (state.currentCriterion.trim()) {
      criteria.push(state.currentCriterion.trim())
    }
    return {
      type: TASK_TYPES[state.type] as TaskType,
      title: state.title.trim(),
      description: state.description.trim() || undefined,
      acceptance_criteria: criteria.length > 0 ? criteria : undefined,
    }
  })
}

export async function interactiveEdit(
  task: TaskData,
): Promise<EditTaskResult | null> {
  const typeIndex = TASK_TYPES.indexOf(task.type)
  const statusIndex = STATUSES.indexOf(task.status)

  return runForm<EditTaskResult>(
    {
      mode: 'edit',
      taskId: task.id,
      initialValues: {
        type: typeIndex >= 0 ? typeIndex : 0,
        status: statusIndex >= 0 ? statusIndex : 0,
        title: task.title,
        description: task.description,
        criteria: [...task.acceptance_criteria],
      },
    },
    (state) => {
      const criteria = [...state.criteria]
      if (state.currentCriterion.trim()) {
        criteria.push(state.currentCriterion.trim())
      }
      return {
        type: TASK_TYPES[state.type] as TaskType,
        status: STATUSES[state.status] as Status,
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        acceptance_criteria: criteria.length > 0 ? criteria : undefined,
      }
    },
  )
}
