import matter from 'gray-matter'
import type { TaskData, TaskType, Status, Priority } from './types.js'

export function render(task: TaskData): string {
  const frontmatter: Record<string, string | number | string[]> = {
    id: task.id,
    title: task.title,
    type: task.type,
    status: task.status,
    created: task.created,
  }
  if (task.flag) {
    frontmatter.flag = task.flag
  }
  if (task.parent) {
    frontmatter.parent = task.parent
  }
  if (task.priority && task.priority !== 3) {
    frontmatter.priority = task.priority
  }
  if (task.blocks && task.blocks.length > 0) {
    frontmatter.blocks = task.blocks
  }

  const sections: string[] = []

  sections.push('## Description')
  sections.push('')
  sections.push(task.description || '')

  sections.push('')
  sections.push('## Acceptance Criteria')
  sections.push('')
  for (const item of task.acceptance_criteria) {
    sections.push(`- [${task.checked_criteria ? 'x' : ' '}] ${item}`)
  }

  const body = '\n' + sections.join('\n') + '\n'
  return matter.stringify(body, frontmatter)
}

export function parse(content: string, _filename: string): TaskData {
  const { data, content: body } = matter(content)

  const title = data.title as string | undefined
  if (!title) {
    throw new Error(
      "Task file missing title in frontmatter. Run 'mrkl migrate_prior_verbose' to fix.",
    )
  }

  // Extract acceptance criteria from checklist items
  const acRegex = /^- \[[ x]\] (.+)$/gm
  const acceptance_criteria: string[] = []
  let match
  while ((match = acRegex.exec(body)) !== null) {
    acceptance_criteria.push(match[1])
  }

  // Extract description: text between "## Description" and "## Acceptance Criteria"
  const descMatch = body.match(
    /## Description\n\n([\s\S]*?)(?:\n\n## Acceptance Criteria|$)/,
  )
  const description = descMatch ? descMatch[1].trim() : ''

  return {
    id: data.id as string,
    type: data.type as TaskType,
    status: data.status as Status,
    created: data.created as string,
    priority: ((data.priority as Priority | undefined) ?? 3) as Priority,
    ...(data.flag ? { flag: data.flag as string } : {}),
    ...(data.parent ? { parent: data.parent as string } : {}),
    ...(data.blocks ? { blocks: data.blocks as string[] } : {}),
    title,
    description,
    acceptance_criteria,
  }
}
