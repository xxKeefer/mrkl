#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { setAsciiMode } from './emoji.js'
import { readState, writeState } from './state.js'
import initCommand from './commands/init.js'
import createCommand from './commands/create.js'
import listCommand from './commands/list.js'
import doneCommand from './commands/done.js'
import pruneCommand from './commands/prune.js'
import closeCommand from './commands/close.js'
import editCommand from './commands/edit.js'
import migrateCommand from './commands/migrate.js'
import installSkillsCommand from './commands/install-skills.js'

// Global theme flags
if (process.argv.includes('--no-emoji')) {
  process.argv = process.argv.filter((a) => a !== '--no-emoji')
  setAsciiMode(true)
  try { writeState({ theme: 'ascii' }) } catch { /* .tasks may not exist yet */ }
} else if (process.argv.includes('--emoji')) {
  process.argv = process.argv.filter((a) => a !== '--emoji')
  setAsciiMode(false)
  try { writeState({ theme: 'emoji' }) } catch { /* .tasks may not exist yet */ }
} else {
  try {
    const state = readState()
    if (state.theme === 'ascii') setAsciiMode(true)
  } catch { /* .tasks may not exist yet */ }
}

export const main = defineCommand({
  meta: {
    name: 'mrkl',
    version: '0.1.0',
    description: 'Lightweight CLI for structured markdown task tracking',
  },
  subCommands: {
    init: initCommand,
    i: initCommand,
    create: createCommand,
    c: createCommand,
    list: listCommand,
    ls: listCommand,
    edit: editCommand,
    e: editCommand,
    done: doneCommand,
    d: doneCommand,
    prune: pruneCommand,
    p: pruneCommand,
    close: closeCommand,
    x: closeCommand,
    migrate_prior_verbose: migrateCommand,
    'install-skills': installSkillsCommand,
  },
})

runMain(main)
