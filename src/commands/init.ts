import { defineCommand } from 'citty'
import { logger } from '../logger.js'
import { initConfig } from '../config.js'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize mrkl in the current project',
  },
  args: {
    prefix: {
      type: 'string',
      description: 'Project prefix for task IDs (e.g., VON)',
    },
  },
  run({ args }) {
    const dir = process.cwd()
    try {
      initConfig(dir, { prefix: args.prefix })
      logger.celebrate('mrkl initialized')
    } catch (err) {
      logger.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
