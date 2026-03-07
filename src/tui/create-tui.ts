import { TASK_TYPES } from '../types.js'
import type { TaskType, CreateTaskOpts } from '../types.js'
import {
  ESC,
  ALT_SCREEN_ON, ALT_SCREEN_OFF, CURSOR_HIDE, CURSOR_SHOW, CLEAR_SCREEN,
  BOLD, DIM, RESET, INVERSE,
  FG_CYAN, FG_YELLOW, FG_GREEN, FG_RED, FG_GRAY,
} from './ansi.js'

interface FormState {
  type: number
  title: string
  description: string
  criteria: string[]
  currentCriterion: string
  activeField: number
  cursorPos: number
  error: string
}

function totalFields(state: FormState): number {
  return 3 + state.criteria.length + 1
}

function clampField(state: FormState): void {
  const max = totalFields(state) - 1
  if (state.activeField < 0) state.activeField = 0
  if (state.activeField > max) state.activeField = max
}

function getCurrentText(state: FormState): string {
  if (state.activeField === 1) return state.title
  if (state.activeField === 2) return state.description
  if (state.activeField >= 3 && state.activeField < 3 + state.criteria.length) {
    return state.criteria[state.activeField - 3]
  }
  if (state.activeField === 3 + state.criteria.length) return state.currentCriterion
  return ''
}

function setCurrentText(state: FormState, text: string): void {
  if (state.activeField === 1) { state.title = text; return }
  if (state.activeField === 2) { state.description = text; return }
  if (state.activeField >= 3 && state.activeField < 3 + state.criteria.length) {
    state.criteria[state.activeField - 3] = text
    return
  }
  if (state.activeField === 3 + state.criteria.length) { state.currentCriterion = text; return }
}

function isTextField(state: FormState): boolean {
  return state.activeField >= 1
}

function render(state: FormState, stdout: NodeJS.WriteStream): void {
  const buf: string[] = []

  buf.push('')
  buf.push(`  ${BOLD}Create Task${RESET}`)
  buf.push('')

  if (state.error) {
    buf.push(`  ${FG_RED}${state.error}${RESET}`)
    buf.push('')
  }

  const fields = buildFieldList(state)
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    const active = i === state.activeField
    const pointer = active ? `${FG_CYAN}>${RESET}` : ' '

    if (i === 0) {
      const typeName = TASK_TYPES[state.type]
      const display = active
        ? `${FG_CYAN}< ${BOLD}${typeName}${RESET}${FG_CYAN} >${RESET}`
        : `  ${typeName}  `
      buf.push(`${pointer} ${DIM}Task type:${RESET}     ${display}`)
    } else {
      const text = getCurrentTextForField(state, i)
      const label = f.label.padEnd(14)
      if (active) {
        const before = text.slice(0, state.cursorPos)
        const cursorChar = text[state.cursorPos] ?? ' '
        const after = text.slice(state.cursorPos + 1)
        buf.push(`${pointer} ${DIM}${label}${RESET} [${before}${INVERSE}${cursorChar}${RESET}${after}]`)
      } else {
        const displayText = text || `${FG_GRAY}(empty)${RESET}`
        buf.push(`${pointer} ${DIM}${label}${RESET} [${displayText}]`)
      }
    }
  }

  buf.push('')
  buf.push(`  ${FG_GRAY}↑↓ navigate | ←→ cycle type | Enter submit | Esc quit${RESET}`)
  buf.push('')

  stdout.write(CLEAR_SCREEN + buf.join('\n'))
}

interface FieldInfo {
  label: string
  index: number
}

function buildFieldList(state: FormState): FieldInfo[] {
  const fields: FieldInfo[] = [
    { label: 'Task type:', index: 0 },
    { label: 'Title:', index: 1 },
    { label: 'Description:', index: 2 },
  ]
  for (let i = 0; i < state.criteria.length; i++) {
    fields.push({ label: `Criterion ${i + 1}:`, index: 3 + i })
  }
  fields.push({ label: 'New criterion:', index: 3 + state.criteria.length })
  return fields
}

function getCurrentTextForField(state: FormState, fieldIndex: number): string {
  if (fieldIndex === 1) return state.title
  if (fieldIndex === 2) return state.description
  if (fieldIndex >= 3 && fieldIndex < 3 + state.criteria.length) {
    return state.criteria[fieldIndex - 3]
  }
  if (fieldIndex === 3 + state.criteria.length) return state.currentCriterion
  return ''
}

export async function interactiveCreate(): Promise<Omit<CreateTaskOpts, 'dir'> | null> {
  const { stdin, stdout } = process

  const state: FormState = {
    type: 0,
    title: '',
    description: '',
    criteria: [],
    currentCriterion: '',
    activeField: 0,
    cursorPos: 0,
    error: '',
  }

  if (stdin.isTTY) stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')
  stdout.write(ALT_SCREEN_ON + CURSOR_HIDE)

  render(state, stdout)

  return new Promise<Omit<CreateTaskOpts, 'dir'> | null>((resolve) => {
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
        moveToField(1)
        render(state, stdout)
        return
      }
      state.error = ''
      cleanup()
      const criteria = [...state.criteria]
      if (state.currentCriterion.trim()) {
        criteria.push(state.currentCriterion.trim())
      }
      resolve({
        type: TASK_TYPES[state.type] as TaskType,
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        acceptance_criteria: criteria.length > 0 ? criteria : undefined,
      })
    }

    function onData(data: string): void {
      for (let i = 0; i < data.length; i++) {
        const ch = data[i]

        if (ch === ESC) {
          if (data[i + 1] === '[') {
            const arrow = data[i + 2]
            if (arrow === 'A') { // Up
              moveToField(state.activeField - 1)
              i += 2
              continue
            }
            if (arrow === 'B') { // Down
              moveToField(state.activeField + 1)
              i += 2
              continue
            }
            if (arrow === 'C') { // Right
              if (state.activeField === 0) {
                state.type = (state.type + 1) % TASK_TYPES.length
              } else if (isTextField(state)) {
                const text = getCurrentText(state)
                if (state.cursorPos < text.length) state.cursorPos++
              }
              i += 2
              continue
            }
            if (arrow === 'D') { // Left
              if (state.activeField === 0) {
                state.type = (state.type - 1 + TASK_TYPES.length) % TASK_TYPES.length
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
          if (state.activeField === 0) {
            // Move to next field
            moveToField(1)
            continue
          }
          const newCriterionField = 3 + state.criteria.length
          if (state.activeField === newCriterionField) {
            if (state.currentCriterion.trim()) {
              state.criteria.push(state.currentCriterion.trim())
              state.currentCriterion = ''
              state.activeField = 3 + state.criteria.length
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
            // If on an existing criterion and it's empty, remove it
            if (state.activeField >= 3 && state.activeField < 3 + state.criteria.length && text.length === 0) {
              const criterionIndex = state.activeField - 3
              state.criteria.splice(criterionIndex, 1)
              // Move up to previous field
              moveToField(state.activeField - 1)
              continue
            }
            if (state.cursorPos > 0) {
              const newText = text.slice(0, state.cursorPos - 1) + text.slice(state.cursorPos)
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
            const newText = text.slice(0, state.cursorPos) + ch + text.slice(state.cursorPos)
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
