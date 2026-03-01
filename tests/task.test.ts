import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initConfig } from "../src/config.js";
import { createTask, listTasks, archiveTask } from "../src/task.js";

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "mrkl-test-"));
  initConfig(tmp, { prefix: "TEST" });
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("task", () => {
  describe("createTask", () => {
    it("creates a file with correct name format and returns TaskData", () => {
      const task = createTask({ dir: tmp, type: "feat", title: "add login" });
      expect(task.id).toBe("TEST-001");
      expect(task.type).toBe("feat");
      expect(task.title).toBe("add login");
      expect(task.status).toBe("todo");
      expect(existsSync(join(tmp, ".tasks", "TEST-001 feat - add login.md"))).toBe(true);
    });

    it("writes correct frontmatter and body", () => {
      const task = createTask({
        dir: tmp,
        type: "fix",
        title: "broken auth",
        description: "Fix the login bug.",
        acceptance_criteria: ["login works", "tests pass"],
      });
      const content = readFileSync(
        join(tmp, ".tasks", "TEST-001 fix - broken auth.md"),
        "utf-8",
      );
      expect(content).toContain("id: TEST-001");
      expect(content).toContain("type: fix");
      expect(content).toContain("status: todo");
      expect(content).toContain("## Description");
      expect(content).toContain("Fix the login bug.");
      expect(content).toContain("- [ ] login works");
      expect(content).toContain("- [ ] tests pass");
    });
    it("increments counter across creates", () => {
      const t1 = createTask({ dir: tmp, type: "feat", title: "first" });
      const t2 = createTask({ dir: tmp, type: "fix", title: "second" });
      expect(t1.id).toBe("TEST-001");
      expect(t2.id).toBe("TEST-002");
    });
  });

  describe("listTasks", () => {
    it("returns all active tasks", () => {
      createTask({ dir: tmp, type: "feat", title: "one" });
      createTask({ dir: tmp, type: "fix", title: "two" });
      const tasks = listTasks({ dir: tmp });
      expect(tasks).toHaveLength(2);
      expect(tasks.map((t) => t.id)).toEqual(["TEST-001", "TEST-002"]);
    });
    it("filters by type and status", () => {
      createTask({ dir: tmp, type: "feat", title: "feature one" });
      createTask({ dir: tmp, type: "fix", title: "bugfix one" });
      createTask({ dir: tmp, type: "feat", title: "feature two" });

      expect(listTasks({ dir: tmp, type: "feat" })).toHaveLength(2);
      expect(listTasks({ dir: tmp, type: "fix" })).toHaveLength(1);
      expect(listTasks({ dir: tmp, status: "todo" })).toHaveLength(3);
      expect(listTasks({ dir: tmp, status: "done" })).toHaveLength(0);
    });
    it("returns empty array when no tasks exist", () => {
      expect(listTasks({ dir: tmp })).toEqual([]);
    });
  });

  describe("archiveTask", () => {
    it("moves task to .archive and updates status to done", () => {
      createTask({ dir: tmp, type: "feat", title: "archive me" });
      archiveTask(tmp, "TEST-001");

      // Original gone from tasks dir
      expect(existsSync(join(tmp, ".tasks", "TEST-001 feat - archive me.md"))).toBe(false);
      // Present in archive
      const archivePath = join(tmp, ".tasks", ".archive", "TEST-001 feat - archive me.md");
      expect(existsSync(archivePath)).toBe(true);
      // Status updated
      const content = readFileSync(archivePath, "utf-8");
      expect(content).toContain("status: done");
    });
    it("throws if task ID not found", () => {
      expect(() => archiveTask(tmp, "TEST-999")).toThrow("Task TEST-999 not found");
    });
  });
});
