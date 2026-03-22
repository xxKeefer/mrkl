#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import initCommand from './commands/init.js'
import createCommand from './commands/create.js'
import listCommand from './commands/list.js'
import doneCommand from './commands/done.js'
import pruneCommand from './commands/prune.js'
import closeCommand from './commands/close.js'
import editCommand from './commands/edit.js'
import installSkillsCommand from './commands/install-skills.js'

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
    'install-skills': installSkillsCommand,
  },
})

runMain(main)
