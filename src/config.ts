import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, stringify } from 'smol-toml'
interface Config {
  prefix: string
  tasks_dir: string
  verbose_files: boolean
}

const CONFIG_PATHS = [join('.config', 'mrkl', 'mrkl.toml'), 'mrkl.toml']

export function loadConfig(dir: string): Config {
  const configPath = CONFIG_PATHS.map((p) => join(dir, p)).find((p) =>
    existsSync(p),
  )

  if (!configPath) {
    throw new Error(`mrkl.toml not found in ${dir}`)
  }

  const raw = readFileSync(configPath, 'utf-8')
  const parsed = parse(raw)
  return {
    prefix: parsed.prefix as string,
    tasks_dir: (parsed.tasks_dir as string) ?? '.tasks',
    verbose_files: (parsed.verbose_files as boolean) ?? false,
  }
}

export function initConfig(dir: string, opts?: Partial<Config>): void {
  const configDir = join(dir, '.config', 'mrkl')
  const configPath = join(configDir, 'mrkl.toml')

  if (!existsSync(configPath)) {
    const config: Config = {
      prefix: opts?.prefix ?? 'TASK',
      tasks_dir: opts?.tasks_dir ?? '.tasks',
      verbose_files: opts?.verbose_files ?? false,
    }
    mkdirSync(configDir, { recursive: true })
    writeFileSync(configPath, stringify(config))
  }

  const config = loadConfig(dir)
  const tasksDir = join(dir, config.tasks_dir)
  mkdirSync(join(tasksDir, '.archive'), { recursive: true })

  const counterPath = join(dir, '.config', 'mrkl', 'mrkl_counter')
  if (!existsSync(counterPath)) {
    writeFileSync(counterPath, '0')
  }
}
