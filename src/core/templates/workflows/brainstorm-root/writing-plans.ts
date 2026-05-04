import type { SkillTemplate, CommandTemplate } from '../../types.js';
import { BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY } from './superpowers-openspec-mapping.js';

export function getBrainstormRootWritingPlansSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-writing-plans',
    description: 'Create a concrete execution plan from approved design artifacts.',
    instructions: `Run the superpowers \`writing-plans\` skill using the approved design and artifacts for the change (for example \`brainstorm.md\` and other completed files under \`openspec/changes/<change-name>/\`).

---

**Input**: The user's request may name a change (kebab-case) or rely on session context; resolve the active change before drafting the plan.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBrainstormRootWritingPlansCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Writing Plans',
    description: 'Generate an execution plan and write execution-plan.md',
    category: 'Workflow',
    tags: ['workflow', 'planning', 'execution-plan'],
    content: `Use the superpowers \`writing-plans\` skill for the active change.

---

**Input**: The argument after \`/opsx:writing-plans\` is the change name (kebab-case), if provided; otherwise infer from session context.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}`,
  };
}
