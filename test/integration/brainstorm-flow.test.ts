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

describe('brainstorm artifact-only end-to-end smoke flow', () => {
  let projectRoot: string;
  let changeDir: string;
  const repoRoot = process.cwd();

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'brainstorm-e2e-'));
    const realSchemaDir = join(repoRoot, 'schemas', 'brainstorm');
    const targetSchemaDir = join(projectRoot, 'openspec', 'schemas', 'brainstorm');
    mkdirSync(targetSchemaDir, { recursive: true });
    cpSync(realSchemaDir, targetSchemaDir, { recursive: true });

    changeDir = join(projectRoot, 'openspec', 'changes', 'demo');
    mkdirSync(changeDir, { recursive: true });
    writeFileSync(join(changeDir, '.openspec.yaml'), 'schema: brainstorm\n');
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('fresh change: brainstorm phase ready, tasks artifact blocked', () => {
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.schemaName).toBe('brainstorm');

    const brainstormArtifact = status.artifacts.find((a) => a.id === 'brainstorm');
    expect(brainstormArtifact?.status).toBe('ready');

    const tasksArtifact = status.artifacts.find((a) => a.id === 'tasks');
    expect(tasksArtifact?.status).toBe('blocked');
    expect(tasksArtifact?.missingDeps).toEqual(['brainstorm']);
  });

  it('after brainstorm.md: tasks ready, plan still blocked', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# Brainstorm');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.artifacts.find((p) => p.id === 'brainstorm')?.status).toBe('done');
    expect(status.artifacts.find((a) => a.id === 'tasks')?.status).toBe('ready');
    expect(status.artifacts.find((p) => p.id === 'plan')?.status).toBe('blocked');
  });

  it('after tasks.md: plan ready', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const status = formatChangeStatus(ctx);

    expect(status.artifacts.find((p) => p.id === 'plan')?.status).toBe('ready');
  });

  it('after plan.md: apply unblocked (generateApplyInstructions returns ready)', async () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    writeFileSync(join(changeDir, 'plan.md'), '# Plan');
    const apply = await generateApplyInstructions(projectRoot, 'demo');
    expect(apply.state).toBe('ready');
    expect(apply.instruction).toContain('fresh verification evidence');
    expect(apply.instruction).not.toContain('superpowers:');
  });

  it('generateInstructions for brainstorm artifact returns canonical instruction', () => {
    const ctx = loadChangeContext(projectRoot, 'demo');
    const inst = generateInstructions(ctx, 'brainstorm', projectRoot);
    expect(inst.outputPath).toBe('brainstorm.md');
    expect(inst.instruction).toContain('workflow prompt supplies the shared choice');
    expect(inst.instruction).not.toContain('superpowers:');
  });

  it('generateInstructions for plan artifact lists brainstorm + tasks deps with kind', () => {
    writeFileSync(join(changeDir, 'brainstorm.md'), '# B');
    writeFileSync(join(changeDir, 'tasks.md'), '## 1. G\n- [ ] 1.1 t');
    const ctx = loadChangeContext(projectRoot, 'demo');
    const inst = generateInstructions(ctx, 'plan', projectRoot);
    expect(inst.outputPath).toBe('plan.md');
    const brainstormDep = inst.dependencies.find((d) => d.id === 'brainstorm');
    const tasksDep = inst.dependencies.find((d) => d.id === 'tasks');
    expect(brainstormDep?.done).toBe(true);
    expect(tasksDep?.done).toBe(true);
  });

  it('plan.md template file exists at the new path (renamed from execution-plan.md)', () => {
    const planTemplatePath = join(
      projectRoot,
      'openspec',
      'schemas',
      'brainstorm',
      'templates',
      'plan.md'
    );
    expect(existsSync(planTemplatePath)).toBe(true);
  });
});
