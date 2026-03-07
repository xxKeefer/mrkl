import { defineCommand } from 'citty'
import consola from 'consola'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

function findPackageRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url))
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
      if (pkg.name === '@xxkeefer/mrkl') return dir
    }
    dir = dirname(dir)
  }
  throw new Error('Could not locate mrkl package root')
}

function copyDirSync(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      writeFileSync(destPath, readFileSync(srcPath))
    }
  }
}

export default defineCommand({
  meta: {
    name: 'install-skills',
    description: 'Install mrkl Claude Code skills into the current project',
  },
  run() {
    const dest = join(process.cwd(), '.claude', 'skills')

    try {
      const packageRoot = findPackageRoot()
      const skillsDir = join(packageRoot, 'skills')

      if (!existsSync(skillsDir)) {
        consola.error('❌ No skills directory found in mrkl package')
        process.exit(1)
      }

      const skills = readdirSync(skillsDir).filter((f) =>
        statSync(join(skillsDir, f)).isDirectory(),
      )

      if (skills.length === 0) {
        consola.info('📭 No skills to install')
        return
      }

      for (const skill of skills) {
        const src = join(skillsDir, skill)
        const target = join(dest, skill)
        copyDirSync(src, target)
        consola.success(`🧩 Installed ${skill}`)
      }
    } catch (err) {
      consola.error(String((err as Error).message))
      process.exit(1)
    }
  },
})
