#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import initCommand from "./commands/init.js";
import createCommand from "./commands/create.js";
import listCommand from "./commands/list.js";
import doneCommand from "./commands/done.js";

const main = defineCommand({
  meta: {
    name: "mrkl",
    version: "0.1.0",
    description: "Lightweight CLI for structured markdown task tracking",
  },
  subCommands: {
    init: initCommand,
    create: createCommand,
    list: listCommand,
    done: doneCommand,
  },
});

runMain(main);
