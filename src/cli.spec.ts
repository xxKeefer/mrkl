import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest'

// Mock citty's runMain to prevent the CLI from actually executing on import
vi.mock('citty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('citty')>()
  return { ...actual, runMain: vi.fn() }
})

vi.mock('./tui/create-tui.js', () => ({
  interactiveCreate: vi.fn(),
}))

import { main } from './cli.js'
import initCommand from './commands/init.js'
import createCommand from './commands/create.js'
import listCommand from './commands/list.js'
import doneCommand from './commands/done.js'
import pruneCommand from './commands/prune.js'
import closeCommand from './commands/close.js'
import * as taskModule from './task.js'
import { interactiveCreate } from './tui/create-tui.js'

type RunCtx = { args: Record<string, unknown> }
const run = (createCommand as { run: (ctx: RunCtx) => Promise<void> }).run

describe('cli aliases', () => {
  it('`c` subcommand is registered', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs).toHaveProperty('c')
  })

  it('`c` is the same command definition as `create`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.c).toBe(subs.create)
  })

  it('`c` points to the createCommand module', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.c).toBe(createCommand)
  })

  it('`i` is the same command definition as `init`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.i).toBe(subs.init)
    expect(subs.i).toBe(initCommand)
  })

  it('`ls` is the same command definition as `list`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.ls).toBe(subs.list)
    expect(subs.ls).toBe(listCommand)
  })

  it('`d` is the same command definition as `done`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.d).toBe(subs.done)
    expect(subs.d).toBe(doneCommand)
  })

  it('`p` is the same command definition as `prune`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.p).toBe(subs.prune)
    expect(subs.p).toBe(pruneCommand)
  })

  it('`x` is the same command definition as `close`', () => {
    const subs = main.subCommands as Record<string, unknown>
    expect(subs.x).toBe(subs.close)
    expect(subs.x).toBe(closeCommand)
  })
})

describe('flag aliases', () => {
  it('create --desc has alias -d', () => {
    const args = createCommand.args as Record<string, { alias?: string }>
    expect(args.desc.alias).toBe('d')
  })

  it('create --ac has alias -a', () => {
    const args = createCommand.args as Record<string, { alias?: string }>
    expect(args.ac.alias).toBe('a')
  })

  it('list --type has alias -t', () => {
    const args = listCommand.args as Record<string, { alias?: string }>
    expect(args.type.alias).toBe('t')
  })

  it('list --status has alias -s', () => {
    const args = listCommand.args as Record<string, { alias?: string }>
    expect(args.status.alias).toBe('s')
  })

  it('prune --force has alias -f', () => {
    const args = pruneCommand.args as Record<string, { alias?: string }>
    expect(args.force.alias).toBe('f')
  })

  it('close --reason has alias -r', () => {
    const args = closeCommand.args as Record<string, { alias?: string }>
    expect(args.reason.alias).toBe('r')
  })

  it('create --parent has alias -p', () => {
    const args = createCommand.args as Record<string, { alias?: string }>
    expect(args.parent.alias).toBe('p')
  })

  it('create --blocks has alias -b', () => {
    const args = createCommand.args as Record<string, { alias?: string }>
    expect(args.blocks.alias).toBe('b')
  })
})

describe('create command --ac flag', () => {
  let createTaskSpy: MockInstance<typeof taskModule.createTask>

  beforeEach(() => {
    createTaskSpy = vi.spyOn(taskModule, 'createTask').mockReturnValue({
      id: 'MRKL-999',
      title: 'test',
    } as ReturnType<typeof taskModule.createTask>)
  })

  afterEach(() => {
    createTaskSpy.mockRestore()
  })

  it('passes multiple --ac values as separate acceptance criteria', async () => {
    await run({
      args: { type: 'feat', title: 'test', ac: ['first', 'second'] },
    })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: ['first', 'second'],
      }),
    )
  })

  it('wraps a single --ac value in an array', async () => {
    await run({ args: { type: 'feat', title: 'test', ac: 'only one' } })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: ['only one'],
      }),
    )
  })

  it('passes undefined when no --ac is provided', async () => {
    await run({ args: { type: 'feat', title: 'test' } })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptance_criteria: undefined,
      }),
    )
  })

  it('passes --parent to createTask', async () => {
    await run({ args: { type: 'feat', title: 'test', parent: 'TEST-001' } })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: 'TEST-001',
      }),
    )
  })

  it('passes --blocks as array when comma-separated', async () => {
    await run({
      args: { type: 'feat', title: 'test', blocks: 'TEST-001,TEST-002' },
    })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: ['TEST-001', 'TEST-002'],
      }),
    )
  })

  it('passes --blocks as array when already an array (repeated flag)', async () => {
    await run({
      args: { type: 'feat', title: 'test', blocks: ['TEST-001', 'TEST-002'] },
    })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: ['TEST-001', 'TEST-002'],
      }),
    )
  })

  it('wraps single --blocks value in array', async () => {
    await run({ args: { type: 'feat', title: 'test', blocks: 'TEST-001' } })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: ['TEST-001'],
      }),
    )
  })

  it('passes undefined parent/blocks when not provided', async () => {
    await run({ args: { type: 'feat', title: 'test' } })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: undefined,
        blocks: undefined,
      }),
    )
  })
})

describe('create command interactive mode', () => {
  let createTaskSpy: MockInstance<typeof taskModule.createTask>
  const mockInteractiveCreate = vi.mocked(interactiveCreate)

  beforeEach(() => {
    createTaskSpy = vi.spyOn(taskModule, 'createTask').mockReturnValue({
      id: 'MRKL-999',
      title: 'test task',
    } as ReturnType<typeof taskModule.createTask>)
  })

  afterEach(() => {
    createTaskSpy.mockRestore()
    mockInteractiveCreate.mockReset()
  })

  it('enters interactive mode when no positional args given', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'feat',
      title: 'test task',
    })

    await run({ args: {} })

    expect(mockInteractiveCreate).toHaveBeenCalledTimes(1)
    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'feat',
        title: 'test task',
      }),
    )
  })

  it('collects multiple acceptance criteria', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'fix',
      title: 'broken login',
      description: 'Fix the auth flow',
      acceptance_criteria: ['login works', 'tests pass'],
    })

    await run({ args: {} })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fix',
        title: 'broken login',
        description: 'Fix the auth flow',
        acceptance_criteria: ['login works', 'tests pass'],
      }),
    )
  })

  it('skips optional fields when left empty', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'chore',
      title: 'update deps',
      description: undefined,
      acceptance_criteria: undefined,
    })

    await run({ args: {} })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chore',
        title: 'update deps',
        description: undefined,
        acceptance_criteria: undefined,
      }),
    )
  })

  it('passes description and criteria correctly', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'feat',
      title: 'no criteria task',
      description: 'some description',
      acceptance_criteria: undefined,
    })

    await run({ args: {} })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'feat',
        title: 'no criteria task',
        description: 'some description',
        acceptance_criteria: undefined,
      }),
    )
  })

  it('passes single criterion correctly', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'fix',
      title: 'one criterion task',
      acceptance_criteria: ['first criterion'],
    })

    await run({ args: {} })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fix',
        title: 'one criterion task',
        acceptance_criteria: ['first criterion'],
      }),
    )
  })

  it('passes multiple criteria correctly', async () => {
    mockInteractiveCreate.mockResolvedValueOnce({
      type: 'chore',
      title: 'two criteria task',
      description: 'a description',
      acceptance_criteria: ['criterion one', 'criterion two'],
    })

    await run({ args: {} })

    expect(createTaskSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chore',
        title: 'two criteria task',
        description: 'a description',
        acceptance_criteria: ['criterion one', 'criterion two'],
      }),
    )
  })

  it('exits gracefully on cancel (returns null)', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })
    mockInteractiveCreate.mockResolvedValueOnce(null)

    await expect(run({ args: {} })).rejects.toThrow('process.exit')
    expect(exitSpy).toHaveBeenCalledWith(0)

    exitSpy.mockRestore()
  })
})

describe('close command', () => {
  const closeRun = (closeCommand as { run: (ctx: RunCtx) => void }).run
  let closeTaskSpy: MockInstance<typeof taskModule.closeTask>

  beforeEach(() => {
    closeTaskSpy = vi
      .spyOn(taskModule, 'closeTask')
      .mockImplementation(() => '' as string)
  })

  afterEach(() => {
    closeTaskSpy.mockRestore()
  })

  it('passes reason to closeTask', () => {
    closeRun({ args: { id: 'TEST-001', reason: 'duplicate' } })
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-001',
      'duplicate',
    )
  })

  it('passes undefined reason when not provided', () => {
    closeRun({ args: { id: 'TEST-001' } })
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-001',
      undefined,
    )
  })

  it('handles multiple positional IDs via args._', () => {
    closeRun({
      args: {
        id: 'TEST-001',
        _: ['TEST-001', 'TEST-002', 'TEST-003'],
        reason: 'batch close',
      },
    })
    expect(closeTaskSpy).toHaveBeenCalledTimes(3)
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-001',
      'batch close',
    )
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-002',
      'batch close',
    )
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-003',
      'batch close',
    )
  })

  it('falls back to args.id when args._ is empty', () => {
    closeRun({ args: { id: 'TEST-001', _: [] } })
    expect(closeTaskSpy).toHaveBeenCalledTimes(1)
    expect(closeTaskSpy).toHaveBeenCalledWith(
      expect.any(String),
      'TEST-001',
      undefined,
    )
  })
})
