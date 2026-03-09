import { defineCommand } from 'citty'
import consola from 'consola'
import { closeTask, getActiveChildren, cascadeClose, orphanChildren } from '../task.js'

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
          consola.info(`Task ${id} has ${children.length} active children:\n${childList}`)
          const choice = await consola.prompt('How should children be handled?', {
            type: 'select',
            options: [
              { label: 'Cancel — do not close this task', value: 'cancel' },
              { label: 'Cascade — mark all children done too', value: 'cascade' },
              { label: 'Orphan — remove parent from children, then close', value: 'orphan' },
            ],
          })

          if (choice === 'cancel' || (choice as unknown) === Symbol.for('cancel')) continue
          if (choice === 'cascade') cascadeClose(dir, id, 'done')
          if (choice === 'orphan') orphanChildren(dir, id)
        }

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
