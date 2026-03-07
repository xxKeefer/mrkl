import matter from 'gray-matter'
import type { TaskData, TaskType, Status } from './types.js'

export function render(task: TaskData): string {
  const frontmatter: Record<string, string> = {
    id: task.id,
    title: task.title,
    type: task.type,
    status: task.status,
    created: task.created,
  }
  if (task.flag) {
    frontmatter.flag = task.flag
  }

  const sections: string[] = []

  sections.push('## Description')
  sections.push('')
  sections.push(task.description || '')

  sections.push('')
  sections.push('## Acceptance Criteria')
  sections.push('')
  for (const item of task.acceptance_criteria) {
    sections.push(`- [ ] ${item}`)
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
    ...(data.flag ? { flag: data.flag as string } : {}),
    title,
    description,
    acceptance_criteria,
  }
}
