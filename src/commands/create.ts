import { defineCommand } from 'citty'
import consola from 'consola'
import { createTask } from '../task.js'
import { TASK_TYPES } from '../types.js'
import type { TaskType, CreateTaskOpts } from '../types.js'
import { interactiveCreate } from '../tui/create-tui.js'

function toStringArray(
  value: unknown,
  splitCommas = false,
): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) return value.map(String)
  const str = String(value)
  if (splitCommas && str.includes(','))
    return str.split(',').map((s) => s.trim())
  return [str]
}

function toOptionalString(value: unknown): string | undefined {
  return value ? String(value) : undefined
}

function toTaskType(value: unknown): TaskType {
  const str = String(value)
  if (!TASK_TYPES.includes(str as TaskType)) {
    consola.error(
      `❌ Invalid type "${str}". Must be one of: ${TASK_TYPES.join(', ')}`,
    )
    process.exit(1)
  }
  return str as TaskType
}

async function promptForTask(dir: string): Promise<CreateTaskOpts> {
  const result = await interactiveCreate()
  if (!result) process.exit(0)
  return { dir, ...result }
}

export default defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new task',
  },
  args: {
    type: {
      type: 'positional',
      description:
        'Task type (feat, fix, chore, docs, perf, refactor, test, ci, build, style)',
      required: false,
    },
    title: {
      type: 'positional',
      description: 'Task title',
      required: false,
    },
    desc: {
      type: 'string',
      alias: 'd',
      description: 'Task description',
    },
    ac: {
      type: 'string',
      alias: 'a',
      description: 'Acceptance criterion (can be specified multiple times)',
    },
    parent: {
      type: 'string',
      alias: 'p',
      description: 'Parent task ID (epic)',
    },
    blocks: {
      type: 'string',
      alias: 'b',
      description:
        'Task ID(s) this blocks (comma-separated or repeated)',
    },
  },
  async run({ args }) {
    const dir = process.cwd()

    const interactive = !args.type && !args.title

    if (!interactive && (!args.type || !args.title)) {
      consola.error(
        '❌ Both type and title are required, or omit both for interactive mode',
      )
      process.exit(1)
    }

    try {
      const opts: CreateTaskOpts = interactive
        ? await promptForTask(dir)
        : {
            dir,
            type: toTaskType(args.type),
            title: String(args.title),
            description: toOptionalString(args.desc),
            acceptance_criteria: toStringArray(args.ac),
            parent: toOptionalString(args.parent),
            blocks: toStringArray(args.blocks, true),
          }

      const task = createTask(opts)
      consola.success(`📝 Created ${task.id}: ${task.title}`)
    } catch (err) {
      consola.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
