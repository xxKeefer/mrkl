import { defineCommand } from "citty";
import consola from "consola";
import { createTask } from "../task.js";
import { TASK_TYPES } from "../types.js";
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
      alias: "d",
      description: "Task description",
    },
    ac: {
      type: "string",
      alias: "a",
      description: "Acceptance criterion (can be specified multiple times)",
    },
  },
  run({ args }) {
    if (!TASK_TYPES.includes(args.type as TaskType)) {
      consola.error(`Invalid type "${args.type}". Must be one of: ${TASK_TYPES.join(", ")}`);
      process.exit(1);
    }

    const dir = process.cwd();
    try {
      const task = createTask({
        dir,
        type: args.type as TaskType,
        title: args.title,
        description: args.desc,
        acceptance_criteria: args.ac
          ? Array.isArray(args.ac) ? args.ac : [args.ac]
          : undefined,
      });
      consola.success(`Created ${task.id}: ${task.title}`);
    } catch (err) {
      consola.error(String((err as Error).message));
      process.exit(1);
    }
  },
});
