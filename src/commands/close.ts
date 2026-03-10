import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { closeTask, getActiveChildren, cascadeClose, orphanChildren } from '../task.js'

export default defineCommand({
  meta: {
    name: 'close',
    description: "Close task(s) (won't do, duplicate, etc.) and archive them",
  },
  args: {
    id: {
      type: 'positional',
      description: 'Task ID(s) to close (e.g., MRKL-001, 001, 1)',
      required: true,
    },
    reason: {
      type: 'string',
      description: "Reason for closing (e.g., duplicate, won't do)",
      alias: 'r',
    },
  },
  async run({ args }) {
    const dir = process.cwd()
    const ids: string[] = (args._ as string[] | undefined)?.length
      ? (args._ as string[])
      : [args.id]

    let failed = false
    for (const id of ids) {
      try {
        const children = getActiveChildren(dir, id)
        if (children.length > 0) {
          const childList = children.map((c) => `  - ${c.id}: ${c.title}`).join('\n')
          logger.info(`Task ${id} has ${children.length} active children:\n${childList}`)
          const choice = await logger.prompt('How should children be handled?', {
            type: 'select',
            options: [
              { label: 'Cancel — do not close this task', value: 'cancel' },
              { label: 'Cascade — close all children too', value: 'cascade' },
              { label: 'Orphan — remove parent from children, then close', value: 'orphan' },
            ],
          })

          if (choice === 'cancel' || (choice as unknown) === Symbol.for('cancel')) continue
          if (choice === 'cascade') cascadeClose(dir, id, 'closed')
          if (choice === 'orphan') orphanChildren(dir, id)
        }

        const resolved = closeTask(dir, id, args.reason)
        logger.closed(`Closed ${resolved}`)
        if (args.reason) logger.flag(args.reason)
      } catch (err) {
        logger.error(`${id}: ${(err as Error).message}`)
        failed = true
      }
    }

    if (failed) {
      process.exit(1)
    }
  },
})
