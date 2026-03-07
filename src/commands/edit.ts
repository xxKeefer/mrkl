import { defineCommand } from 'citty'
import consola from 'consola'
import { findTaskFile, updateTask, listTasks, listArchivedTasks } from '../task.js'

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
  },
  async run({ args }) {
    const dir = process.cwd()

    try {
      let task

      if (args.id) {
        const found = findTaskFile(dir, args.id as string)
        task = found.task
      } else {
        const tasks = listTasks({ dir })
        const archivedTasks = listArchivedTasks({ dir })

        if (tasks.length === 0 && archivedTasks.length === 0) {
          consola.info('No tasks found')
          return
        }

        const { interactiveList } = await import('../tui/list-tui.js')
        const selected = await interactiveList(tasks, archivedTasks)
        if (!selected) return
        task = selected
      }

      const { interactiveEdit } = await import('../tui/create-tui.js')
      const result = await interactiveEdit(task)
      if (!result) return

      const updated = updateTask(dir, task.id, result)
      consola.success(`Updated ${updated.id}: ${updated.title}`)
    } catch (err) {
      consola.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
