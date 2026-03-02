import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock citty's runMain to prevent the CLI from actually executing on import
vi.mock("citty", async (importOriginal) => {
  const actual = await importOriginal<typeof import("citty")>();
  return { ...actual, runMain: vi.fn() };
});

import { main } from "../src/cli.js";
import createCommand from "../src/commands/create.js";
import * as taskModule from "../src/task.js";

describe("cli aliases", () => {
  it("`c` subcommand is registered", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs).toHaveProperty("c");
  });

  it("`c` is the same command definition as `create`", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs.c).toBe(subs.create);
  });

  it("`c` points to the createCommand module", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs.c).toBe(createCommand);
  });
});

describe("create command --ac flag", () => {
  let createTaskSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createTaskSpy = vi.spyOn(taskModule, "createTask").mockReturnValue({
      id: "MRKL-999",
      title: "test",
    } as ReturnType<typeof taskModule.createTask>);
  });

  afterEach(() => {
    createTaskSpy.mockRestore();
  });

  it("passes multiple --ac values as separate acceptance criteria", async () => {
    const run = (createCommand as { run: (ctx: { args: Record<string, unknown> }) => void }).run;
    run({ args: { type: "feat", title: "test", ac: ["first", "second"] } });

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: ["first", "second"],
      }),
    );
  });

  it("wraps a single --ac value in an array", async () => {
    const run = (createCommand as { run: (ctx: { args: Record<string, unknown> }) => void }).run;
    run({ args: { type: "feat", title: "test", ac: "only one" } });

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: ["only one"],
      }),
    );
  });

  it("passes undefined when no --ac is provided", async () => {
    const run = (createCommand as { run: (ctx: { args: Record<string, unknown> }) => void }).run;
    run({ args: { type: "feat", title: "test" } });

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: undefined,
      }),
    );
  });
});
