import { defineCommand } from 'citty'
import consola from 'consola'
import { closeTask } from '../task.js'

export default defineCommand({
  meta: {
    name: 'done',
    description: 'Mark task(s) as done and archive them',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Task ID(s) to mark as done (e.g., MRKL-001, 001, 1)',
      required: true,
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
        const resolved = closeTask(dir, id, 'completed', 'done')
        consola.success(` ✅ Done ${resolved} 🚩 completed`)
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
