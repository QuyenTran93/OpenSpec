import { describe, expect, it } from 'vitest';

import {
  getBrainstormBrainstormSkillTemplate,
  getBrainstormProposeSkillTemplate,
  getBrainstormWritingPlansSkillTemplate,
  getOpsxBrainstormBrainstormCommandTemplate,
  getOpsxBrainstormProposeCommandTemplate,
  getOpsxBrainstormWritingPlansCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';

describe('brainstorm workflow progression', () => {
  it('does not require user confirmation before the next command', () => {
    const bodies = [
      getBrainstormBrainstormSkillTemplate().instructions,
      getBrainstormProposeSkillTemplate().instructions,
      getBrainstormWritingPlansSkillTemplate().instructions,
      getOpsxBrainstormBrainstormCommandTemplate().content,
      getOpsxBrainstormProposeCommandTemplate().content,
      getOpsxBrainstormWritingPlansCommandTemplate().content,
    ];

    for (const body of bodies) {
      expect(body).not.toContain('confirm the user agrees with its chosen approach');
      expect(body).not.toContain('Before creating downstream artifacts');
    }
  });
});
