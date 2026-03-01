import { defineCommand } from "citty";
import consola from "consola";
import { createTask } from "../task.js";
import type { TaskType } from "../types.js";

export default defineCommand({
  meta: {
    name: "create",
    description: "Create a new task",
  },
  args: {
    type: {
      type: "positional",
      description:
        "Task type (feat, fix, chore, docs, perf, refactor, test, ci, build, style)",
      required: true,
    },
    title: {
      type: "positional",
      description: "Task title",
      required: true,
    },
    desc: {
      type: "string",
      description: "Task description",
    },
    ac: {
      type: "string",
      description: "Acceptance criterion (can be specified multiple times)",
    },
  },
  run({ args }) {
    const dir = process.cwd();
    const task = createTask({
      dir,
      type: args.type as TaskType,
      title: args.title,
      description: args.desc,
      acceptance_criteria: args.ac ? [args.ac] : undefined,
    });
    consola.success(`Created ${task.id}: ${task.title}`);
  },
});
