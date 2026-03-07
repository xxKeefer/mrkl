export const TASK_TYPES = [
  "feat",
  "fix",
  "chore",
  "docs",
  "perf",
  "refactor",
  "test",
  "ci",
  "build",
  "style",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const STATUSES = ["todo", "in-progress", "done", "closed"] as const;

export type Status = (typeof STATUSES)[number];

export interface Config {
  prefix: string;
  tasks_dir: string;
  verbose_files: boolean;
}

export interface TaskData {
  id: string;
  type: TaskType;
  status: Status;
  created: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
}

export interface CreateTaskOpts {
  dir: string;
  type: TaskType;
  title: string;
  description?: string;
  acceptance_criteria?: string[];
}

export interface ListFilter {
  dir: string;
  type?: TaskType;
  status?: Status;
}

export interface PruneResult {
  deleted: Array<{ id: string; title: string; created: string; filename: string }>;
  total: number;
}
