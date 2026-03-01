import type { Config } from "./types.js";

export function loadConfig(_dir: string): Config {
  throw new Error("not implemented");
}

export function initConfig(
  _dir: string,
  _opts?: Partial<Config>,
): void {
  throw new Error("not implemented");
}
