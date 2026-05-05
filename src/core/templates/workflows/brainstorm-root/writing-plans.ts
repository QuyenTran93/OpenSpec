import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
} from './superpowers-openspec-mapping.js';

export function getBrainstormRootWritingPlansSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-writing-plans',
    description: 'Create a concrete execution plan from approved design artifacts.',
    instructions: `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:writing-plans\` appears in your available skills list. If missing, STOP and inform the user that the Superpowers plugin must be installed (or that they can explicitly opt to write \`execution-plan.md\` manually using the template below). Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:writing-plans**.

Run the superpowers \`writing-plans\` skill using the approved design and artifacts for the change (for example \`brainstorm.md\`, \`design.md\` when present, and other completed files under \`openspec/changes/<change-name>/\`). Run this **after** propose/continue has produced all required schema artifacts; it comes **before** \`openspec-apply-change\` / \`/opsx:apply\`.

---

**Input**: The user's request may name a change (kebab-case) or rely on session context; resolve the active change before drafting the plan.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`,
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
    content: `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:writing-plans\` appears in your available skills list. If missing, STOP and inform the user that the Superpowers plugin must be installed (or that they can explicitly opt to write \`execution-plan.md\` manually using the template below). Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:writing-plans**.

Use the superpowers \`writing-plans\` skill for the active change. Use **after** \`/opsx:propose\` or \`/opsx:continue\` has completed required artifacts; **before** \`/opsx:apply\`.

---

**Input**: The argument after \`/opsx:writing-plans\` is the change name (kebab-case), if provided; otherwise infer from session context.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`,
  };
}
