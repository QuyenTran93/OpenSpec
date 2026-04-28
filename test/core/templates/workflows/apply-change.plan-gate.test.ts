import { describe, expect, it } from 'vitest';

import {
  getApplyChangeSkillTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
} from '../../../../src/core/templates/skill-templates.js';

function expectPlanGatePrecedesImplementationLoop(template: string): void {
  const step6ToImplement = template.match(
    /6\.\s\*\*Gate on execution plan before implementation loop\*\*\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?:7\.\s\*\*(?:Apply execution environment policy|Execution environment policy)\*\*\s*[\s\S]*?)?\d+\.\s\*\*Implement tasks \(loop until done or blocked\)\*\*/
  );
  expect(step6ToImplement).not.toBeNull();
  expect(step6ToImplement?.[1]).toContain('schemas/brainstorm-root/schema.yaml');
  expect(step6ToImplement?.[1]).toContain('git commit');
  expect(step6ToImplement?.[1]).toContain('plan.md');
  expect(step6ToImplement?.[1]).not.toContain('execution-plan.md');
  expect(step6ToImplement?.[1]).toContain('writing-plans');
  expect(step6ToImplement?.[1]).toContain('superpowers:test-driven-development');
  expect(step6ToImplement?.[1]).toContain('superpowers:requesting-code-review');
  expect(step6ToImplement?.[1]).toContain('superpowers:verification-before-completion');
  expect(step6ToImplement?.[1]).toContain('using-git-worktrees');
}

describe('apply change template plan gate', () => {
  it('brainstorm-root: requires plan.md before implementation loop', () => {
    const skillTemplate = getBrainstormRootApplyChangeSkillTemplate().instructions;
    const commandTemplate = getOpsxBrainstormRootApplyCommandTemplate().content;

    expectPlanGatePrecedesImplementationLoop(skillTemplate);
    expectPlanGatePrecedesImplementationLoop(commandTemplate);
  });

  it('legacy spec-driven: uses main-style apply flow without plan.md gate', () => {
    const skillTemplate = getApplyChangeSkillTemplate().instructions;
    const commandTemplate = getOpsxApplyCommandTemplate().content;

    expect(skillTemplate).not.toContain('Gate on execution plan before implementation loop');
    expect(skillTemplate).toContain('openspec instructions apply');

    expect(commandTemplate).not.toContain('Gate on execution plan before implementation loop');
    expect(commandTemplate).toContain('openspec instructions apply');
  });
});
