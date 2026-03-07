import { TASK_TYPES, STATUSES } from '../types.js'
import type { TaskType, Status, CreateTaskOpts, TaskData, EditTaskResult } from '../types.js'
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
  if (state.activeField >= critStart && state.activeField < critStart + state.criteria.length) {
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
  if (state.activeField >= critStart && state.activeField < critStart + state.criteria.length) {
    state.criteria[state.activeField - critStart] = text
    return
  }
  if (state.activeField === critStart + state.criteria.length) {
    state.currentCriterion = text
    return
  }
}

function getCurrentTextForField(state: FormState, fieldIndex: number): string {
  const titleIdx = titleFieldIndex(state)
  const descIdx = descFieldIndex(state)
  const critStart = criteriaStartIndex(state)

  if (fieldIndex === titleIdx) return state.title
  if (fieldIndex === descIdx) return state.description
  if (fieldIndex >= critStart && fieldIndex < critStart + state.criteria.length) {
    return state.criteria[fieldIndex - critStart]
  }
  if (fieldIndex === critStart + state.criteria.length) return state.currentCriterion
  return ''
}

interface FieldInfo {
  label: string
  index: number
  kind: 'cycle' | 'text'
}

function buildFieldList(state: FormState): FieldInfo[] {
  const critStart = criteriaStartIndex(state)
  const fields: FieldInfo[] = [
    { label: 'Task type:', index: 0, kind: 'cycle' },
  ]
  if (state.mode === 'edit') {
    fields.push({ label: 'Status:', index: 1, kind: 'cycle' })
  }
  fields.push({ label: 'Title:', index: titleFieldIndex(state), kind: 'text' })
  fields.push({ label: 'Description:', index: descFieldIndex(state), kind: 'text' })
  for (let i = 0; i < state.criteria.length; i++) {
    fields.push({ label: `Criterion ${i + 1}:`, index: critStart + i, kind: 'text' })
  }
  fields.push({ label: 'New criterion:', index: critStart + state.criteria.length, kind: 'text' })
  return fields
}

function render(state: FormState, stdout: NodeJS.WriteStream): void {
  const buf: string[] = []

  buf.push('')
  const header = state.mode === 'edit'
    ? `Edit Task ${state.taskId ?? ''}`
    : 'Create Task'
  buf.push(`  ${BOLD}${header}${RESET}`)
  buf.push('')

  if (state.error) {
    buf.push(`  ${FG_RED}${state.error}${RESET}`)
    buf.push('')
  }

  const fields = buildFieldList(state)
  for (const f of fields) {
    const active = f.index === state.activeField
    const pointer = active ? `${FG_CYAN}>${RESET}` : ' '

    if (f.kind === 'cycle') {
      const items: readonly string[] = f.index === 0 ? TASK_TYPES : STATUSES
      const stateIndex = f.index === 0 ? state.type : state.status
      const value = items[stateIndex]
      const display = active
        ? `${FG_CYAN}< ${BOLD}${value}${RESET}${FG_CYAN} >${RESET}`
        : `  ${value}  `
      buf.push(`${pointer} ${DIM}${f.label.padEnd(14)}${RESET} ${display}`)
    } else {
      const text = getCurrentTextForField(state, f.index)
      const label = f.label.padEnd(14)
      if (active) {
        const before = text.slice(0, state.cursorPos)
        const cursorChar = text[state.cursorPos] ?? ' '
        const after = text.slice(state.cursorPos + 1)
        buf.push(
          `${pointer} ${DIM}${label}${RESET} [${before}${INVERSE}${cursorChar}${RESET}${after}]`,
        )
      } else {
        const displayText = text || `${FG_GRAY}(empty)${RESET}`
        buf.push(`${pointer} ${DIM}${label}${RESET} [${displayText}]`)
      }
    }
  }

  buf.push('')
  const cycleHint = state.mode === 'edit'
    ? '←→ cycle type/status'
    : '←→ cycle type'
  buf.push(
    `  ${FG_GRAY}↑↓ navigate | ${cycleHint} | Enter submit | Esc quit${RESET}`,
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

    function onData(data: string): void {
      const critStart = criteriaStartIndex(state)

      for (let i = 0; i < data.length; i++) {
        const ch = data[i]

        if (ch === ESC) {
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
              // Right
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
              // Left
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
                text.slice(0, state.cursorPos - 1) + text.slice(state.cursorPos)
              setCurrentText(state, newText)
              state.cursorPos--
            }
          }
          continue
        }

        // Printable characters
        if (ch >= ' ' && ch <= '~') {
          if (isTextField(state)) {
            state.error = ''
            const text = getCurrentText(state)
            const newText =
              text.slice(0, state.cursorPos) + ch + text.slice(state.cursorPos)
            setCurrentText(state, newText)
            state.cursorPos++
          }
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
  return runForm<Omit<CreateTaskOpts, 'dir'>>(
    { mode: 'create' },
    (state) => {
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
    },
  )
}

export async function interactiveEdit(task: TaskData): Promise<EditTaskResult | null> {
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
