import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadChangeContext,
  generateInstructions,
} from '../../src/core/artifact-graph/index.js';
import { generateApplyInstructions } from '../../src/commands/workflow/instructions.js';

describe('CLI instructions command — phase support (brainstorm-root v2)', () => {
  let projectRoot: string;
  let changeDir: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'openspec-phase-cli-'));
    const schemaDir = join(projectRoot, 'openspec', 'schemas', 'brainstorm-root');
    mkdirSync(schemaDir, { recursive: true });
    mkdirSync(join(schemaDir, 'templates'), { recursive: true });
    writeFileSync(
      join(schemaDir, 'schema.yaml'),
      `name: brainstorm-root
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [brainstorm]
    instruction: 'Read brainstorm.md'
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  requires: []
  instruction: 'Use superpowers:brainstorming'
plan:
  generates: plan.md
  template: plan.md
  requires: [brainstorm, tasks]
  instruction: 'Use superpowers:writing-plans'
apply:
  requires: [tasks, plan]
  tracks: tasks.md
  executionPlan: plan.md
  instruction: 'Apply plan'
`
    );
    writeFileSync(join(schemaDir, 'templates', 'tasks.md'), '## 1. Group\n- [ ] 1.1 Task');
    writeFileSync(join(schemaDir, 'templates', 'brainstorm.md'), '# Brainstorm');
    writeFileSync(join(schemaDir, 'templates', 'plan.md'), '# Plan');

    changeDir = join(projectRoot, 'openspec', 'changes', 'demo');
    mkdirSync(changeDir, { recursive: true });
    writeFileSync(join(changeDir, '.openspec.yaml'), 'schema: brainstorm-root\n');
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('generateInstructions resolves phase ids (brainstorm, plan)', () => {
    const ctx = loadChangeContext(projectRoot, 'demo');
    const inst = generateInstructions(ctx, 'brainstorm', projectRoot);
    expect(inst.kind).toBe('phase');
    expect(inst.outputPath).toBe('brainstorm.md');
    expect(inst.instruction).toContain('superpowers:brainstorming');
  });

  it('generateApplyInstructions blocks when plan phase output is missing', async () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1.\n- [ ] 1.1 t');
    const apply = await generateApplyInstructions(projectRoot, 'demo');
    expect(apply.state).toBe('blocked');
    expect(apply.missingArtifacts).toContain('plan');
  });

  it('generateApplyInstructions ready when all required files exist', async () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1.\n- [ ] 1.1 t');
    writeFileSync(join(changeDir, 'plan.md'), '# Plan');
    const apply = await generateApplyInstructions(projectRoot, 'demo');
    expect(apply.state).toBe('ready');
  });

  it('generateApplyInstructions reports missing tasks artifact when tasks.md absent', async () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'plan.md'), '# Plan');
    const apply = await generateApplyInstructions(projectRoot, 'demo');
    expect(apply.state).toBe('blocked');
    expect(apply.missingArtifacts).toContain('tasks');
  });
});
