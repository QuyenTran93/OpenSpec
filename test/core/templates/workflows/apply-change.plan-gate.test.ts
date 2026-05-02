import { describe, expect, it } from 'vitest';

import {
  getApplyChangeSkillTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
} from '../../../../src/core/templates/skill-templates.js';

function expectPlanGatePrecedesImplementationLoop(template: string): void {
  const step6To7 = template.match(
    /6\.\s\*\*Gate on execution plan before implementation loop\*\*([\s\S]*?)7\.\s\*\*Implement tasks \(loop until done or blocked\)\*\*/
  );
  expect(step6To7).not.toBeNull();
  expect(step6To7?.[1]).toContain('execution-plan.md');
  expect(step6To7?.[1]).toContain('writing-plans');
}

describe('apply change template plan gate', () => {
  it('brainstorm-root: requires execution-plan.md before implementation loop', () => {
    const skillTemplate = getBrainstormRootApplyChangeSkillTemplate().instructions;
    const commandTemplate = getOpsxBrainstormRootApplyCommandTemplate().content;

    expectPlanGatePrecedesImplementationLoop(skillTemplate);
    expectPlanGatePrecedesImplementationLoop(commandTemplate);
  });

  it('legacy spec-driven: uses main-style apply flow without execution-plan gate', () => {
    const skillTemplate = getApplyChangeSkillTemplate().instructions;
    const commandTemplate = getOpsxApplyCommandTemplate().content;

    expect(skillTemplate).not.toContain('Gate on execution plan before implementation loop');
    expect(skillTemplate).not.toContain('execution-plan.md');
    expect(skillTemplate).toContain('openspec instructions apply');

    expect(commandTemplate).not.toContain('Gate on execution plan before implementation loop');
    expect(commandTemplate).not.toContain('execution-plan.md');
    expect(commandTemplate).toContain('openspec instructions apply');
  });
});
