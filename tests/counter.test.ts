import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { nextId, currentId } from "../src/counter.js";

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "mrkl-test-"));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("counter", () => {
  describe("nextId", () => {
    it("returns 1 when counter file does not exist", () => {
      expect(nextId(tmp)).toBe(1);
    });

    it("reads counter, increments, writes back, and returns new value", () => {
      writeFileSync(join(tmp, "mrkl_counter"), "5");
      expect(nextId(tmp)).toBe(6);
      expect(readFileSync(join(tmp, "mrkl_counter"), "utf-8")).toBe("6");
    });
    it("persists across multiple calls", () => {
      expect(nextId(tmp)).toBe(1);
      expect(nextId(tmp)).toBe(2);
      expect(nextId(tmp)).toBe(3);
    });
  });

  describe("currentId", () => {
    it("returns current counter value without incrementing", () => {
      writeFileSync(join(tmp, "mrkl_counter"), "7");
      expect(currentId(tmp)).toBe(7);
      expect(currentId(tmp)).toBe(7);
    });
    it("returns 0 if counter file does not exist", () => {
      expect(currentId(tmp)).toBe(0);
    });
  });
});
