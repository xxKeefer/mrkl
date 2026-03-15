import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { findTaskFile, patchTask, updateTask, listTasks, listArchivedTasks } from '../task.js'
import type { PatchTaskOpts } from '../types.js'

export default defineCommand({
  meta: {
    name: 'edit',
    description: 'Edit an existing task',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Task ID to edit (omit for interactive selection)',
      required: false,
    },
    title: {
      type: 'string',
      description: 'New title',
    },
    type: {
      type: 'string',
      alias: 't',
      description: 'New task type',
    },
    status: {
      type: 'string',
      alias: 's',
      description: 'New status',
    },
    desc: {
      type: 'string',
      alias: 'd',
      description: 'New description',
    },
    ac: {
      type: 'string',
      description: 'Acceptance criterion (repeatable)',
    },
    parent: {
      type: 'string',
      alias: 'p',
      description: 'Parent task ID',
    },
    blocks: {
      type: 'string',
      alias: 'b',
      description: 'Task ID(s) this blocks (comma-separated or repeated)',
    },
  },
  async run({ args }) {
    const dir = process.cwd()

    try {
      const hasCliFlags = args.title || args.type || args.status ||
        args.desc || args.ac || args.parent || args.blocks

      if (hasCliFlags && args.id) {
        const patch: PatchTaskOpts = {}

        if (args.title) patch.title = args.title as string
        if (args.type) patch.type = args.type as PatchTaskOpts['type']
        if (args.status) patch.status = args.status as PatchTaskOpts['status']
        if (args.desc) patch.description = args.desc as string
        if (args.ac) {
          const raw = args.ac
          patch.acceptance_criteria = Array.isArray(raw) ? raw as string[] : [raw as string]
        }
        if (args.parent) patch.parent = args.parent as string
        if (args.blocks) {
          const raw = args.blocks
          const items = Array.isArray(raw)
            ? (raw as string[]).flatMap((b: string) => b.split(','))
            : (raw as string).split(',')
          patch.blocks = items.map((b: string) => b.trim()).filter(Boolean)
        }

        const updated = patchTask(dir, args.id as string, patch)
        logger.update(`Updated ${updated.id}: ${updated.title}`)
        return
      }

      let task
      const tasks = listTasks({ dir })

      if (args.id) {
        const found = findTaskFile(dir, args.id as string)
        task = found.task
      } else {
        const archivedTasks = listArchivedTasks({ dir })

        if (tasks.length === 0 && archivedTasks.length === 0) {
          logger.empty('No tasks found')
          return
        }

        const { interactiveList } = await import('../tui/list-tui.js')
        const selected = await interactiveList(tasks, archivedTasks)
        if (!selected) return
        task = selected
      }

      const { interactiveEdit } = await import('../tui/create-tui.js')
      const result = await interactiveEdit(task, tasks)
      if (!result) return

      const updated = updateTask(dir, task.id, result)
      logger.update(`Updated ${updated.id}: ${updated.title}`)
    } catch (err) {
      logger.error(`${(err as Error).message}`)
      process.exit(1)
    }
  },
})
