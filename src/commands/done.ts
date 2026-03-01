import { defineCommand } from "citty";
import consola from "consola";
import { archiveTask } from "../task.js";

export default defineCommand({
  meta: {
    name: "done",
    description: "Mark a task as done and archive it",
  },
  args: {
    id: {
      type: "positional",
      description: "Task ID to mark as done (e.g., VON-001)",
      required: true,
    },
  },
  run({ args }) {
    const dir = process.cwd();
    archiveTask(dir, args.id);
    consola.success(`Archived ${args.id}`);
  },
});
