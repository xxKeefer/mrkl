import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./config.js";
import { nextId } from "./counter.js";
import { render, parse } from "./template.js";
import type { CreateTaskOpts, ListFilter, TaskData } from "./types.js";

export function createTask(opts: CreateTaskOpts): TaskData {
  const config = loadConfig(opts.dir);
  const num = nextId(opts.dir);
  const id = `${config.prefix}-${String(num).padStart(3, "0")}`;
  const today = new Date().toISOString().slice(0, 10);

  const task: TaskData = {
    id,
    type: opts.type,
    status: "todo",
    created: today,
    title: opts.title,
    description: opts.description ?? "",
    acceptance_criteria: opts.acceptance_criteria ?? [],
  };

  const filename = `${id} ${task.type} - ${task.title}.md`;
  const tasksDir = join(opts.dir, config.tasks_dir);
  writeFileSync(join(tasksDir, filename), render(task));

  return task;
}

export function listTasks(filter: ListFilter): TaskData[] {
  const config = loadConfig(filter.dir);
  const tasksDir = join(filter.dir, config.tasks_dir);

  const files = readdirSync(tasksDir).filter(
    (f) => f.endsWith(".md") && !f.startsWith("."),
  );

  let tasks = files.map((f) => {
    const content = readFileSync(join(tasksDir, f), "utf-8");
    return parse(content, f);
  });

  if (filter.type) tasks = tasks.filter((t) => t.type === filter.type);
  if (filter.status) tasks = tasks.filter((t) => t.status === filter.status);

  return tasks;
}

export function archiveTask(dir: string, id: string): void {
  const config = loadConfig(dir);
  const tasksDir = join(dir, config.tasks_dir);

  const file = readdirSync(tasksDir).find(
    (f) => f.endsWith(".md") && f.startsWith(id),
  );

  if (!file) {
    throw new Error(`Task ${id} not found`);
  }

  const filePath = join(tasksDir, file);
  const content = readFileSync(filePath, "utf-8");
  const task = parse(content, file);
  task.status = "done";

  const archivePath = join(tasksDir, ".archive", file);
  writeFileSync(archivePath, render(task));
  unlinkSync(filePath);
}
