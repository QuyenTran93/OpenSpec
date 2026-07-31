import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { resolveSchema } from '../../src/core/artifact-graph/resolver.js';

describe('brainstorm schema', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const schema = resolveSchema('brainstorm', projectRoot);

  it('uses the existing artifact graph for brainstorm, tasks, and plan', () => {
    expect(schema.version).toBe(1);
    expect(schema.artifacts.map((artifact) => artifact.id)).toEqual([
      'brainstorm',
      'tasks',
      'plan',
    ]);
    expect(schema.artifacts.find((artifact) => artifact.id === 'tasks')?.requires).toEqual([
      'brainstorm',
    ]);
    expect(schema.artifacts.find((artifact) => artifact.id === 'plan')?.requires).toEqual([
      'brainstorm',
      'tasks',
    ]);
  });

  it('gates apply on plan and tracks tasks without a second execution-plan contract', () => {
    expect(schema.apply?.requires).toEqual(['plan']);
    expect(schema.apply?.tracks).toBe('tasks.md');
    expect(schema.apply).not.toHaveProperty('executionPlan');
  });

  it('contains native workflow disciplines without external plugin references', () => {
    const instructions = [
      ...schema.artifacts.map((artifact) => artifact.instruction ?? ''),
      schema.apply?.instruction ?? '',
    ].join('\n');

    expect(instructions).toContain('Ask one clarifying');
    expect(instructions).toContain('stable numeric task IDs');
    expect(instructions).toContain('RED → GREEN → REFACTOR');
    expect(instructions).toContain('fresh verification evidence');
    expect(instructions).not.toMatch(/superpowers:|plugin install/i);
    expect(instructions).not.toMatch(/user_acknowledged|design_approved|self_review_passed/);
  });
});
