import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { listTasks, listArchivedTasks, updateTask, groupByEpic } from '../task.js'
import type { Status, TaskType } from '../types.js'

const COL_ID = 14
const COL_TYPE = 12
const COL_STATUS = 14

function formatRow(
  id: string,
  type: string,
  status: string,
  title: string,
): string {
  return `${id.padEnd(COL_ID)}${type.padEnd(COL_TYPE)}${status.padEnd(COL_STATUS)}${title}`
}

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List active tasks',
  },
  args: {
    type: {
      type: 'string',
      alias: 't',
      description: 'Filter by task type',
    },
    status: {
      type: 'string',
      alias: 's',
      description: 'Filter by status (todo, in-progress, done)',
    },
    plain: {
      type: 'boolean',
      alias: 'p',
      description: 'Plain text output (no interactive TUI)',
    },
  },
  async run({ args }) {
    const dir = process.cwd()
    try {
      const filter = {
        dir,
        type: args.type as TaskType | undefined,
        status: args.status as Status | undefined,
      }

      const tasks = listTasks(filter)
      const archivedTasks = listArchivedTasks(filter)

      if (tasks.length === 0 && archivedTasks.length === 0) {
        logger.empty('No tasks found')
        return
      }

      const usePlain = args.plain || !process.stdout.isTTY

      if (usePlain) {
        logger.log(formatRow('ID', 'TYPE', 'STATUS', 'TITLE'))
        logger.log('\u2500'.repeat(60))
        const grouped = groupByEpic(tasks)
        const childrenByParent = new Map<string, typeof grouped>()
        for (const entry of grouped) {
          if (entry.indent === 1) {
            const parentId = entry.task.parent!
            const list = childrenByParent.get(parentId) ?? []
            list.push(entry)
            childrenByParent.set(parentId, list)
          }
        }
        for (const entry of grouped) {
          const indicators: string[] = []
          if (entry.blocksIndicator) indicators.push(entry.blocksIndicator)
          if (entry.blockedByIndicator) indicators.push(entry.blockedByIndicator)
          const suffix = indicators.length > 0 ? ` ${indicators.join(' ')}` : ''

          if (entry.indent === 1) {
            const siblings = childrenByParent.get(entry.task.parent!) ?? []
            const isLast = siblings[siblings.length - 1] === entry
            const prefix = isLast ? '  \u2514\u2500 ' : '  \u251C\u2500 '
            logger.log(`${prefix}${formatRow(entry.task.id, entry.task.type, entry.task.status, entry.task.title)}${suffix}`)
          } else {
            logger.log(`${formatRow(entry.task.id, entry.task.type, entry.task.status, entry.task.title)}${suffix}`)
          }
        }
        if (archivedTasks.length > 0) {
          logger.log('')
          logger.log(`Archive (${archivedTasks.length}):`)
          logger.log('\u2500'.repeat(60))
          for (const task of archivedTasks) {
            logger.log(formatRow(task.id, task.type, task.status, task.title))
          }
        }
        return
      }

      const { interactiveList } = await import('../tui/list-tui.js')
      const { interactiveEdit } = await import('../tui/create-tui.js')

      let currentTasks = tasks
      let currentArchived = archivedTasks

      const reload = () => ({
        tasks: listTasks(filter),
        archivedTasks: listArchivedTasks(filter),
      })

      while (true) {
        const selected = await interactiveList(currentTasks, currentArchived, reload)
        if (!selected) break

        const result = await interactiveEdit(selected, currentTasks)
        if (result) {
          updateTask(dir, selected.id, result)
        }

        currentTasks = listTasks(filter)
        currentArchived = listArchivedTasks(filter)
      }
    } catch (err) {
      logger.error(`${(err as Error).message}`)
      process.exit(1)
    }
  },
})
