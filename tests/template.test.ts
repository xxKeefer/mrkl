import { describe, it, expect } from 'vitest'
import { render, parse } from '../src/template.js'
import type { TaskData } from '../src/types.js'

const SAMPLE_TASK: TaskData = {
  id: 'TEST-001',
  type: 'feat',
  status: 'todo',
  created: '2026-03-01',
  title: 'implement template module',
  description: 'Build the template rendering system.',
  acceptance_criteria: ['render produces frontmatter', 'parse extracts fields'],
}

describe('template', () => {
  describe('render', () => {
    it('produces correct YAML frontmatter', () => {
      const output = render(SAMPLE_TASK)
      expect(output).toMatch(/^---\n/)
      expect(output).toContain('id: TEST-001')
      expect(output).toContain('title: implement template module')
      expect(output).toContain('type: feat')
      expect(output).toContain('status: todo')
      expect(output).toContain("created: '2026-03-01'")
    })

    it('includes Description section', () => {
      const output = render(SAMPLE_TASK)
      expect(output).toContain('## Description')
      expect(output).toContain('Build the template rendering system.')
    })
    it('renders acceptance criteria as checklist', () => {
      const output = render(SAMPLE_TASK)
      expect(output).toContain('## Acceptance Criteria')
      expect(output).toContain('- [ ] render produces frontmatter')
      expect(output).toContain('- [ ] parse extracts fields')
    })
    it('handles empty description and empty acceptance criteria', () => {
      const task: TaskData = {
        ...SAMPLE_TASK,
        description: '',
        acceptance_criteria: [],
      }
      const output = render(task)
      expect(output).toContain('## Description')
      expect(output).toContain('## Acceptance Criteria')
      expect(output).not.toContain('- [ ]')
    })
  })

  describe('parse', () => {
    it('extracts frontmatter fields into TaskData', () => {
      const content = render(SAMPLE_TASK)
      const result = parse(
        content,
        'TEST-001 feat - implement template module.md',
      )
      expect(result.id).toBe('TEST-001')
      expect(result.type).toBe('feat')
      expect(result.status).toBe('todo')
      expect(result.created).toBe('2026-03-01')
    })
    it('extracts title from frontmatter', () => {
      const content = render(SAMPLE_TASK)
      const result = parse(content, 'TEST-001.md')
      expect(result.title).toBe('implement template module')
    })
    it('throws when no title in frontmatter', () => {
      const content = `---\nid: TEST-001\ntype: feat\nstatus: todo\ncreated: '2026-03-01'\n---\n\n## Description\n\n\n\n## Acceptance Criteria\n\n`
      expect(() => parse(content, 'TEST-001.md')).toThrow(
        "Task file missing title in frontmatter. Run 'mrkl migrate_prior_verbose' to fix.",
      )
    })
    it('extracts acceptance criteria items', () => {
      const content = render(SAMPLE_TASK)
      const result = parse(content, 'TEST-001.md')
      expect(result.acceptance_criteria).toEqual([
        'render produces frontmatter',
        'parse extracts fields',
      ])
    })
    it('round-trips with render', () => {
      const content = render(SAMPLE_TASK)
      const result = parse(content, 'TEST-001.md')
      expect(result).toEqual(SAMPLE_TASK)
    })
  })
})
