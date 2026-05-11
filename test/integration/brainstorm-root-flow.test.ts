import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadChangeContext,
  generateInstructions,
  formatChangeStatus,
} from '../../src/core/artifact-graph/index.js';
import { generateApplyInstructions } from '../../src/commands/workflow/instructions.js';

describe('brainstorm-root v2 end-to-end smoke flow', () => {
  let projectRoot: string;
  let changeDir: string;
  const repoRoot = process.cwd();

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'brainstorm-root-e2e-'));
    const realSchemaDir = join(repoRoot, 'schemas', 'brainstorm-root');
    const targetSchemaDir = join(projectRoot, 'openspec', 'schemas', 'brainstorm-root');
    mkdirSync(targetSchemaDir, { recursive: true });
    cpSync(realSchemaDir, targetSchemaDir, { recursive: true });

    changeDir = join(projectRoot, 'openspec', 'changes', 'demo');
    mkdirSync(changeDir, { recursive: true });
    writeFileSync(join(changeDir, '.openspec.yaml'), 'schema: brainstorm-root\n');
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('fresh change: brainstorm phase ready, tasks artifact blocked', () => {
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.schemaName).toBe('brainstorm-root');

    const brainstormPhase = status.phases.find((p) => p.id === 'brainstorm');
    expect(brainstormPhase?.status).toBe('ready');

    const tasksArtifact = status.artifacts.find((a) => a.id === 'tasks');
    expect(tasksArtifact?.status).toBe('blocked');
    expect(tasksArtifact?.missingDeps).toEqual(['brainstorm']);
  });

  it('after brainstorm.md: tasks ready, plan still blocked', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# Brainstorm');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.phases.find((p) => p.id === 'brainstorm')?.status).toBe('done');
    expect(status.artifacts.find((a) => a.id === 'tasks')?.status).toBe('ready');
    expect(status.phases.find((p) => p.id === 'plan')?.status).toBe('blocked');
  });

  it('after tasks.md: plan ready', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.phases.find((p) => p.id === 'plan')?.status).toBe('ready');
  });

  it('after plan.md: apply unblocked (generateApplyInstructions returns ready)', async () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    writeFileSync(join(changeDir, 'plan.md'), '# Plan');
    const apply = await generateApplyInstructions(projectRoot, 'demo');
    expect(apply.state).toBe('ready');
    expect(apply.instruction).toContain('superpowers:subagent-driven-development');
  });

  it('generateInstructions for brainstorm phase returns canonical instruction', () => {
    const ctx = loadChangeContext(projectRoot, 'demo');
    const inst = generateInstructions(ctx, 'brainstorm', projectRoot);
    expect(inst.kind).toBe('phase');
    expect(inst.outputPath).toBe('brainstorm.md');
    expect(inst.instruction).toContain('superpowers:brainstorming');
    expect(inst.instruction).toContain('all_questions_resolved');
  });

  it('generateInstructions for plan phase lists brainstorm + tasks deps with kind', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const inst = generateInstructions(ctx, 'plan', projectRoot);
    expect(inst.kind).toBe('phase');
    expect(inst.outputPath).toBe('plan.md');
    const brainstormDep = inst.dependencies.find((d) => d.id === 'brainstorm');
    const tasksDep = inst.dependencies.find((d) => d.id === 'tasks');
    expect(brainstormDep?.kind).toBe('phase');
    expect(brainstormDep?.done).toBe(true);
    expect(tasksDep?.kind).toBe('artifact');
    expect(tasksDep?.done).toBe(true);
  });

  it('plan.md template file exists at the new path (renamed from execution-plan.md)', () => {
    const planTemplatePath = join(
      projectRoot,
      'openspec',
      'schemas',
      'brainstorm-root',
      'templates',
      'plan.md'
    );
    expect(existsSync(planTemplatePath)).toBe(true);
  });
});
