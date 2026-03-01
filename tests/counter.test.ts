import { describe, it, expect } from "vitest";

describe("counter", () => {
  describe("nextId", () => {
    it.todo("reads counter, increments, writes back, and returns new value");
    it.todo("initializes from 0 if counter file does not exist");
    it.todo("persists across multiple calls");
  });

  describe("currentId", () => {
    it.todo("returns current counter value without incrementing");
    it.todo("returns 0 if counter file does not exist");
  });
});
