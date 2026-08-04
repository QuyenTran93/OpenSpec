import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { getSchemaDir, resolveSchema } from '../../src/core/artifact-graph/resolver.js';

describe('brainstorm schema', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const schema = resolveSchema('brainstorm', projectRoot);
  const schemaDir = getSchemaDir('brainstorm', projectRoot)!;

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

  it('defines a reviewable brainstorm output contract with independent-review fallback', () => {
    const artifact = schema.artifacts.find((item) => item.id === 'brainstorm')!;
    const template = fs.readFileSync(path.join(schemaDir, 'templates', artifact.template), 'utf-8');
    const contract = `${artifact.instruction}\n${template}`;

    for (const marker of [
      '## Success Criteria',
      '## Current Context',
      '## Architecture',
      '## Components and Responsibilities',
      '## Interfaces and Data Flow',
      '## Errors and Edge Cases',
      '## Compatibility and Migration',
      '## Testing Strategy',
      '## Risks and Mitigations',
      '## Questions',
      'two or three viable approaches',
      'explain why fewer',
      'long-term project quality',
      'clean design and reuse',
      'shipping speed alone',
      'requirements coverage',
      'independent review',
      'review-only subagent',
      'expanded inline self-review',
      'user approval',
    ]) {
      expect(contract).toContain(marker);
    }
  });

  it('requires contextual recommendations for every multiple-choice question', () => {
    const instruction = schema.artifacts.find((item) => item.id === 'brainstorm')?.instruction ?? '';
    const normalized = instruction.replace(/\s+/g, ' ');

    expect(normalized).toContain('two or more options');
    expect(normalized).toContain('exactly one option as `(Recommended)`');
    expect(normalized).toContain('briefly explain why');
    expect(normalized).toContain('ask one focused clarifying question');
    expect(normalized).toContain('Never guess');
    expect(normalized).toContain('does not select it for the user');
  });

  it('defines an executable plan contract and always-inline execution policy', () => {
    const artifact = schema.artifacts.find((item) => item.id === 'plan')!;
    const template = fs.readFileSync(path.join(schemaDir, 'templates', artifact.template), 'utf-8');
    const contract = `${artifact.instruction}\n${template}\n${schema.apply?.instruction ?? ''}`;

    expect(template).toContain('fresh focused and project-level verification');
    expect(template).toContain('must not edit files, implement tasks, or orchestrate the apply loop');
    expect(template).toContain('commit, push, merge, and branch integration decisions');
    expect(template).toContain('user or controlling repository policy');
    expect(template).toContain('<planningHome.root>/TODO.md');
    expect(template).toContain('follow-up work');
    expect(template).toContain('manual testing, verification, archiving');
    expect(template).toContain('routine workflow-completion steps');
    expect(template).toContain('VCS decisions');
    expect(template).toContain('required to complete the current change');
    expect(template).toContain('must remain in tasks.md and plan.md');
    expect(template).toContain('semantically equivalent');
    expect(template).toContain('Do not create or modify');
    expect(template).toContain('deferred outcome');
    expect(template).toContain('why it was deferred');
    expect(template).toContain('originating change');
    expect(template).toContain('acceptance criteria');
    expect(template).toContain('- Test: `<resolved-test-path>`');
    expect(template).toContain('```<language>');
    expect(template).toContain('Run: `<focused-test-command>`');
    expect(template).not.toContain('file.test.ts');
    expect(template).not.toContain('```ts');
    expect(template).not.toContain('pnpm test');
    expect(template).not.toContain('- Test: `path/to/test`');
    expect(template).not.toContain('## Test Organization');

    for (const marker of [
      '## Architecture',
      '## Tech Stack',
      '## Global Constraints',
      '## File Responsibilities',
      '**Source tasks:**',
      '**Interfaces:**',
      '- Create:',
      'Write the failing test',
      'Expected: FAIL',
      'minimal implementation',
      'Expected: PASS',
      'Refactor',
      'Commit checkpoint',
      '## Final Verification',
      'independent review',
      'expanded inline self-review',
      'user approval',
      'inline in the primary session',
      'review or read-only research',
      'documentation-only or configuration-only',
      'why no behavior changes',
      'isolated worktree',
      'dependency order',
      'requirements compliance before code quality',
      'Verify review feedback',
      'existing local test convention is authoritative',
      '`tests/`, `test/`, or `__tests__/`',
      'nearest package or module scope',
      'deliberate colocated-test convention',
      'second test-root convention',
      'Do not migrate existing tests',
      'Do not create an empty test directory',
      'Replace every semantic template placeholder',
      'exact project-specific path, code-fence language, command, and expected result',
      'Raw semantic placeholders must not remain in plan.md',
    ]) {
      expect(contract).toContain(marker);
    }

    expect(contract).not.toContain('test-path organization');

    expect(schema.apply?.instruction).toContain('<planningHome.root>/TODO.md');
    expect(schema.apply?.instruction).toContain('manual testing, verification, archiving');
    expect(schema.apply?.instruction).toContain('semantically equivalent');
    expect(schema.apply?.instruction).toContain('Do not create or modify');
    expect(schema.apply?.instruction).toContain('acceptance criteria and focused verification pass');
    expect(schema.apply?.instruction).toContain('before starting the next task');
    expect(schema.apply?.instruction).toContain('Never batch-fill');
    expect(schema.apply?.instruction).toContain('failed, partial, or blocked');
    expect(schema.apply?.instruction).toContain('If updating tasks.md fails, stop');
    expect(schema.apply?.instruction).toContain('On resume, reread tasks.md');
    expect(schema.apply?.instruction).toContain('first incomplete task');

    for (const marker of [
      'acceptance criteria and focused verification pass',
      'before starting the next task',
      'Never batch-fill',
      'failed, partial, or blocked',
      'If updating tasks.md fails, stop',
      'On resume, reread tasks.md',
      'first incomplete task',
    ]) {
      expect(template).toContain(marker);
    }
  });
});
