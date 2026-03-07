import { defineCommand } from "citty";
import consola from "consola";
import { listTasks, listArchivedTasks } from "../task.js";
import type { Status, TaskType } from "../types.js";

const COL_ID = 14
const COL_TYPE = 12
const COL_STATUS = 14

function formatRow(id: string, type: string, status: string, title: string): string {
  return `${id.padEnd(COL_ID)}${type.padEnd(COL_TYPE)}${status.padEnd(COL_STATUS)}${title}`
}

export default defineCommand({
  meta: {
    name: "list",
    description: "List active tasks",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Filter by task type",
    },
    status: {
      type: "string",
      alias: "s",
      description: "Filter by status (todo, in-progress, done)",
    },
    plain: {
      type: "boolean",
      alias: "p",
      description: "Plain text output (no interactive TUI)",
    },
  },
  async run({ args }) {
    const dir = process.cwd();
    try {
      const filter = {
        dir,
        type: args.type as TaskType | undefined,
        status: args.status as Status | undefined,
      };

      const tasks = listTasks(filter);
      const archivedTasks = listArchivedTasks(filter);

      if (tasks.length === 0 && archivedTasks.length === 0) {
        consola.info("No tasks found");
        return;
      }

      const usePlain = args.plain || !process.stdout.isTTY;

      if (usePlain) {
        consola.log(formatRow('ID', 'TYPE', 'STATUS', 'TITLE'));
        consola.log('─'.repeat(60));
        for (const task of tasks) {
          consola.log(formatRow(task.id, task.type, task.status, task.title));
        }
        if (archivedTasks.length > 0) {
          consola.log('');
          consola.log(`Archive (${archivedTasks.length}):`);
          consola.log('─'.repeat(60));
          for (const task of archivedTasks) {
            consola.log(formatRow(task.id, task.type, task.status, task.title));
          }
        }
        return;
      }

      const { interactiveList } = await import('../tui/list-tui.js');
      await interactiveList(tasks, archivedTasks);
    } catch (err) {
      consola.error(String((err as Error).message));
      process.exit(1);
    }
  },
});
