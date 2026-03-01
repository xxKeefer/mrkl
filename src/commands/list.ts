import { defineCommand } from "citty";
import consola from "consola";
import { listTasks } from "../task.js";
import type { Status, TaskType } from "../types.js";

export default defineCommand({
  meta: {
    name: "list",
    description: "List active tasks",
  },
  args: {
    type: {
      type: "string",
      description: "Filter by task type",
    },
    status: {
      type: "string",
      description: "Filter by status (todo, in-progress, done)",
    },
  },
  run({ args }) {
    const dir = process.cwd();
    const tasks = listTasks({
      dir,
      type: args.type as TaskType | undefined,
      status: args.status as Status | undefined,
    });

    if (tasks.length === 0) {
      consola.info("No tasks found");
      return;
    }

    for (const task of tasks) {
      consola.log(`${task.id}  ${task.type.padEnd(10)} ${task.status.padEnd(12)} ${task.title}`);
    }
  },
});
