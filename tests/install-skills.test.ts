import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock citty's runMain to prevent the CLI from actually executing on import
vi.mock("citty", async (importOriginal) => {
  const actual = await importOriginal<typeof import("citty")>();
  return { ...actual, runMain: vi.fn() };
});

import { main } from "../src/cli.js";
import installSkillsCommand from "../src/commands/install-skills.js";

describe("install-skills registration", () => {
  it("`install-skills` subcommand is registered", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs).toHaveProperty("install-skills");
  });

  it("`install-skills` points to the installSkillsCommand module", () => {
    const subs = main.subCommands as Record<string, unknown>;
    expect(subs["install-skills"]).toBe(installSkillsCommand);
  });

  it("has no alias", () => {
    const subs = main.subCommands as Record<string, unknown>;
    const values = Object.entries(subs).filter(([, v]) => v === installSkillsCommand);
    expect(values).toHaveLength(1);
    expect(values[0][0]).toBe("install-skills");
  });
});

describe("install-skills command", () => {
  let tmp: string;
  let originalCwd: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "mrkl-install-skills-"));
    originalCwd = process.cwd();
    vi.spyOn(process, "cwd").mockReturnValue(tmp);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("copies skill files to .claude/skills/ in the target directory", async () => {
    const run = (installSkillsCommand as { run: () => Promise<void> | void }).run;
    await run();

    const skillMd = join(tmp, ".claude", "skills", "plan-from-task", "SKILL.md");
    expect(existsSync(skillMd)).toBe(true);

    const content = readFileSync(skillMd, "utf-8");
    expect(content).toContain("name: plan-from-task");
  });

  it("creates .claude/skills/ directory if it does not exist", async () => {
    const dest = join(tmp, ".claude", "skills");
    expect(existsSync(dest)).toBe(false);

    const run = (installSkillsCommand as { run: () => Promise<void> | void }).run;
    await run();

    expect(existsSync(dest)).toBe(true);
  });

  it("overwrites existing skill files on re-install", async () => {
    const skillDir = join(tmp, ".claude", "skills", "plan-from-task");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "old content");

    const run = (installSkillsCommand as { run: () => Promise<void> | void }).run;
    await run();

    const content = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
    expect(content).not.toBe("old content");
    expect(content).toContain("name: plan-from-task");
  });
});
