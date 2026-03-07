import { defineCommand } from 'citty'
import consola from 'consola'
import { closeTask } from '../task.js'

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
  run({ args }) {
    const dir = process.cwd()
    const ids: string[] = (args._ as string[] | undefined)?.length
      ? (args._ as string[])
      : [args.id]

    let failed = false
    for (const id of ids) {
      try {
        const resolved = closeTask(dir, id, args.reason)
        consola.success(` 🚫 Closed ${resolved} 🚩 ${args.reason}`)
      } catch (err) {
        consola.error(`${id}: ${(err as Error).message}`)
        failed = true
      }
    }

    if (failed) {
      process.exit(1)
    }
  },
})
