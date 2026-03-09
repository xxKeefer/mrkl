import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { parseCutoffDate, pruneTasks, executePrune } from '../task.js'

export default defineCommand({
  meta: {
    name: 'prune',
    description: 'Delete archived tasks created on or before a given date',
  },
  args: {
    date: {
      type: 'positional',
      description: 'Cutoff date (YYYY-MM-DD or YYYYMMDD)',
      required: true,
    },
    force: {
      type: 'boolean',
      alias: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    },
  },
  async run({ args }) {
    const dir = process.cwd()

    let cutoff: string
    try {
      cutoff = parseCutoffDate(args.date)
    } catch (err) {
      logger.error(String((err as Error).message))
      process.exit(1)
    }

    const result = pruneTasks(dir, cutoff)

    if (result.deleted.length === 0) {
      logger.empty(`No archived tasks found on or before ${cutoff}`)
      return
    }

    logger.found(`Found ${result.deleted.length} task(s) to prune:`)
    for (const task of result.deleted) {
      logger.log(`  ${task.id} — ${task.title} (${task.created})`)
    }

    if (!args.force) {
      const confirm = await logger.prompt('Delete these tasks?', {
        type: 'confirm',
      })
      if (typeof confirm === 'symbol' || !confirm) {
        logger.quit('Aborted')
        return
      }
    }

    executePrune(
      dir,
      result.deleted.map((t) => t.filename),
    )
    logger.delete(`Pruned ${result.deleted.length} archived task(s)`)
  },
})
