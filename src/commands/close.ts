import { defineCommand } from "citty";
import consola from "consola";
import { closeTask } from "../task.js";

export default defineCommand({
  meta: {
    name: "close",
    description: "Close a task (won't do, duplicate, etc.) and archive it",
  },
  args: {
    id: {
      type: "positional",
      description: "Task ID to close (e.g., VON-001)",
      required: true,
    },
  },
  run({ args }) {
    const dir = process.cwd();
    try {
      closeTask(dir, args.id);
      consola.success(`🚫 Closed ${args.id}`);
    } catch (err) {
      consola.error(String((err as Error).message));
      process.exit(1);
    }
  },
});
