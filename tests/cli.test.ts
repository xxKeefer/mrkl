import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock citty's runMain to prevent the CLI from actually executing on import
vi.mock("citty", async (importOriginal) => {
  const actual = await importOriginal<typeof import("citty")>();
  return { ...actual, runMain: vi.fn() };
});

import { main } from "../src/cli.js";
import createCommand from "../src/commands/create.js";

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
