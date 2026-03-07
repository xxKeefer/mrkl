import { defineCommand } from 'citty'
import consola from 'consola'
import { createTask } from '../task.js'
import { TASK_TYPES } from '../types.js'
import type { TaskType, CreateTaskOpts } from '../types.js'
import { interactiveCreate } from '../tui/create-tui.js'

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
            type: (() => {
              if (!TASK_TYPES.includes(args.type as TaskType)) {
                consola.error(
                  `❌ Invalid type "${args.type}". Must be one of: ${TASK_TYPES.join(', ')}`,
                )
                process.exit(1)
              }
              return args.type as TaskType
            })(),
            title: args.title as string,
            description: args.desc,
            acceptance_criteria: args.ac
              ? Array.isArray(args.ac)
                ? args.ac
                : [args.ac]
              : undefined,
          }

      const task = createTask(opts)
      consola.success(`📝 Created ${task.id}: ${task.title}`)
    } catch (err) {
      consola.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
