import { describe, expect, it } from 'vitest';

import {
  getApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
} from '../../../../src/core/templates/workflows/apply-change.js';

function expectPlanGatePrecedesImplementationLoop(template: string): void {
  const step6To7 = template.match(
    /6\.\s\*\*Gate on execution plan before implementation loop\*\*([\s\S]*?)7\.\s\*\*Implement tasks \(loop until done or blocked\)\*\*/
  );
  expect(step6To7).not.toBeNull();
  expect(step6To7?.[1]).toContain('execution-plan.md');
  expect(step6To7?.[1]).toContain('writing-plans');
}

describe('apply change template plan gate', () => {
  it('requires execution-plan.md before implementation loop', () => {
    const skillTemplate = getApplyChangeSkillTemplate().instructions;
    const commandTemplate = getOpsxApplyCommandTemplate().content;

    expectPlanGatePrecedesImplementationLoop(skillTemplate);
    expectPlanGatePrecedesImplementationLoop(commandTemplate);
  });
});
