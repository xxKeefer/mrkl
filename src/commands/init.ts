import { defineCommand } from "citty";
import consola from "consola";
import { initConfig } from "../config.js";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize mrkl in the current project",
  },
  args: {
    prefix: {
      type: "string",
      description: "Project prefix for task IDs (e.g., VON)",
    },
  },
  run({ args }) {
    const dir = process.cwd();
    initConfig(dir, { prefix: args.prefix });
    consola.success("mrkl initialized");
  },
});
