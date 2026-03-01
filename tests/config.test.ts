import { describe, it, expect } from "vitest";

describe("config", () => {
  describe("loadConfig", () => {
    it.todo("reads mrkl.toml and returns Config");
    it.todo("throws if mrkl.toml not found");
    it.todo("applies default tasks_dir when not specified");
  });

  describe("initConfig", () => {
    it.todo("creates mrkl.toml with given prefix");
    it.todo("creates .tasks directory");
    it.todo("creates mrkl_counter file");
    it.todo("is idempotent — does not overwrite existing config");
  });
});
