import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";

// Mock citty's runMain to prevent the CLI from actually executing on import
vi.mock("citty", async (importOriginal) => {
  const actual = await importOriginal<typeof import("citty")>();
  return { ...actual, runMain: vi.fn() };
});

import { main } from "../src/cli.js";
import initCommand from "../src/commands/init.js";
import createCommand from "../src/commands/create.js";
import listCommand from "../src/commands/list.js";
import doneCommand from "../src/commands/done.js";
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

  it("`i` is the same command definition as `init`", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs.i).toBe(subs.init);
    expect(subs.i).toBe(initCommand);
  });

  it("`ls` is the same command definition as `list`", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs.ls).toBe(subs.list);
    expect(subs.ls).toBe(listCommand);
  });

  it("`d` is the same command definition as `done`", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs.d).toBe(subs.done);
    expect(subs.d).toBe(doneCommand);
  });
});

describe("flag aliases", () => {
  it("create --desc has alias -d", () => {
    const args = createCommand.args as Record<string, { alias?: string }>;
    expect(args.desc.alias).toBe("d");
  });

  it("create --ac has alias -a", () => {
    const args = createCommand.args as Record<string, { alias?: string }>;
    expect(args.ac.alias).toBe("a");
  });

  it("list --type has alias -t", () => {
    const args = listCommand.args as Record<string, { alias?: string }>;
    expect(args.type.alias).toBe("t");
  });

  it("list --status has alias -s", () => {
    const args = listCommand.args as Record<string, { alias?: string }>;
    expect(args.status.alias).toBe("s");
  });
});

describe("create command --ac flag", () => {
  let createTaskSpy: MockInstance<typeof taskModule.createTask>;

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
