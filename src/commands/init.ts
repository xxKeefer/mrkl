import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { TASKS_DIR } from '../id.js'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize mrkl in the current project',
  },
  run() {
    const dir = process.cwd()
    try {
      mkdirSync(join(dir, TASKS_DIR, '.archive'), { recursive: true })
      logger.celebrate('mrkl initialized')
    } catch (err) {
      logger.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
