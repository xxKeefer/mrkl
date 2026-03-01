import type { TaskData } from "./types.js";

export function render(_task: TaskData): string {
  throw new Error("not implemented");
}

export function parse(_content: string): TaskData {
  throw new Error("not implemented");
}
