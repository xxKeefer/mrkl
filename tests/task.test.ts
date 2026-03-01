import { describe, it, expect } from "vitest";

describe("task", () => {
  describe("createTask", () => {
    it.todo("creates a file with correct name format");
    it.todo("writes correct frontmatter and body");
    it.todo("increments counter");
    it.todo("returns created task data");
  });

  describe("listTasks", () => {
    it.todo("returns all active tasks");
    it.todo("filters by type");
    it.todo("filters by status");
    it.todo("returns empty array when no tasks exist");
  });

  describe("archiveTask", () => {
    it.todo("moves task file to .archive directory");
    it.todo("updates status to done in frontmatter");
    it.todo("throws if task ID not found");
  });
});
