import matter from "gray-matter";
import type { TaskData, TaskType, Status } from "./types.js";

export function render(task: TaskData): string {
  const frontmatter = {
    id: task.id,
    type: task.type,
    status: task.status,
    created: task.created,
  };

  const sections: string[] = [];

  sections.push("## Description");
  sections.push("");
  sections.push(task.description || "");

  sections.push("");
  sections.push("## Acceptance Criteria");
  sections.push("");
  for (const item of task.acceptance_criteria) {
    sections.push(`- [ ] ${item}`);
  }

  const body = sections.join("\n") + "\n";
  return matter.stringify(body, frontmatter);
}

export function parse(content: string, filename: string): TaskData {
  const { data, content: body } = matter(content);

  // Extract title from filename: "PREFIX-NNN type - title.md"
  const titleMatch = filename.replace(/\.md$/, "").match(/^\S+\s+\S+\s+-\s+(.+)$/);
  const title = titleMatch ? titleMatch[1] : "";

  // Extract acceptance criteria from checklist items
  const acRegex = /^- \[[ x]\] (.+)$/gm;
  const acceptance_criteria: string[] = [];
  let match;
  while ((match = acRegex.exec(body)) !== null) {
    acceptance_criteria.push(match[1]);
  }

  // Extract description: text between "## Description" and "## Acceptance Criteria"
  const descMatch = body.match(/## Description\n\n([\s\S]*?)(?:\n\n## Acceptance Criteria|$)/);
  const description = descMatch ? descMatch[1].trim() : "";

  return {
    id: data.id as string,
    type: data.type as TaskType,
    status: data.status as Status,
    created: data.created as string,
    title,
    description,
    acceptance_criteria,
  };
}
