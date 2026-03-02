import { defineCommand } from "citty";
import consola from "consola";
import { createTask } from "../task.js";
import { TASK_TYPES } from "../types.js";
import type { TaskType, CreateTaskOpts } from "../types.js";

async function promptForTask(dir: string): Promise<CreateTaskOpts> {
  const type = await consola.prompt("Task type", {
    type: "select",
    options: TASK_TYPES.map((t) => t),
  });
  if (typeof type === "symbol") process.exit(0);

  const title = await consola.prompt("Task title", {
    type: "text",
    placeholder: "e.g. add user authentication",
  });
  if (typeof title === "symbol") process.exit(0);
  if (!title.trim()) {
    consola.error("Title cannot be empty");
    process.exit(1);
  }

  const desc = await consola.prompt("Description (optional, enter to skip)", {
    type: "text",
    placeholder: "Describe the task in detail",
  });
  if (typeof desc === "symbol") process.exit(0);

  const criteria: string[] = [];
  while (true) {
    const ac = await consola.prompt(
      criteria.length === 0
        ? "Acceptance criterion (Esc to skip)"
        : `Criterion #${criteria.length + 1} (Esc to finish)`,
      { type: "text" },
    );
    if (typeof ac === "symbol") break;
    if (ac.trim()) criteria.push(ac.trim());
  }

  return {
    dir,
    type: type as TaskType,
    title,
    description: desc || undefined,
    acceptance_criteria: criteria.length > 0 ? criteria : undefined,
  };
}

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
      required: false,
    },
    title: {
      type: "positional",
      description: "Task title",
      required: false,
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
  async run({ args }) {
    const dir = process.cwd();

    const interactive = !args.type && !args.title;

    if (!interactive && (!args.type || !args.title)) {
      consola.error("Both type and title are required, or omit both for interactive mode");
      process.exit(1);
    }

    try {
      const opts: CreateTaskOpts = interactive
        ? await promptForTask(dir)
        : {
            dir,
            type: (() => {
              if (!TASK_TYPES.includes(args.type as TaskType)) {
                consola.error(`Invalid type "${args.type}". Must be one of: ${TASK_TYPES.join(", ")}`);
                process.exit(1);
              }
              return args.type as TaskType;
            })(),
            title: args.title as string,
            description: args.desc,
            acceptance_criteria: args.ac
              ? Array.isArray(args.ac) ? args.ac : [args.ac]
              : undefined,
          };

      const task = createTask(opts);
      consola.success(`Created ${task.id}: ${task.title}`);
    } catch (err) {
      consola.error(String((err as Error).message));
      process.exit(1);
    }
  },
});
