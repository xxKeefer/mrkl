import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COUNTER_FILE = join(".config", "mrkl", "mrkl_counter");

export function nextId(dir: string): number {
  const filePath = join(dir, COUNTER_FILE);
  const current = existsSync(filePath)
    ? parseInt(readFileSync(filePath, "utf-8").trim(), 10)
    : 0;
  const next = current + 1;
  writeFileSync(filePath, String(next));
  return next;
}

export function currentId(dir: string): number {
  const filePath = join(dir, COUNTER_FILE);
  if (!existsSync(filePath)) return 0;
  return parseInt(readFileSync(filePath, "utf-8").trim(), 10);
}
