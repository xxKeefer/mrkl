import type { CreateTaskOpts, ListFilter, TaskData } from "./types.js";

export function createTask(_opts: CreateTaskOpts): TaskData {
  throw new Error("not implemented");
}

export function listTasks(_filter: ListFilter): TaskData[] {
  throw new Error("not implemented");
}

export function archiveTask(_dir: string, _id: string): void {
  throw new Error("not implemented");
}
