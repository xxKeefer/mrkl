import { describe, it, expect } from "vitest";

describe("template", () => {
  describe("render", () => {
    it.todo("produces correct YAML frontmatter");
    it.todo("includes Description section");
    it.todo("renders acceptance criteria as checklist");
    it.todo("handles empty acceptance criteria");
  });

  describe("parse", () => {
    it.todo("parses frontmatter fields correctly");
    it.todo("extracts title from filename context");
    it.todo("extracts acceptance criteria items");
    it.todo("round-trips with render");
  });
});
