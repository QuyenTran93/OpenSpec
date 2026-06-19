import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_GATE_POLICY_BLOCK,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
  BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY,
} from './superpowers-openspec-mapping.js';

const WRITING_PLANS_THIN_BODY = (argDescription: string): string => `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:writing-plans\` appears in your available skills list. If missing, STOP and inform the user. Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:writing-plans**.

---

**Input**: ${argDescription}

**Steps**

1. Resolve the active change name (existing logic).

2. Get phase instructions from the schema (canonical source-of-truth):
   \`\`\`bash
   openspec instructions plan --change "<name>" --schema brainstorm-root --json
   \`\`\`

3. Follow the returned \`instruction\` field. It contains:
   - PRECHECK and **superpowers:writing-plans** invocation
   - OpenSpec path overrides (\`plan.md\` only — never \`docs/superpowers/plans/\`)
   - Mandatory planning flow **steps 1–7** (scope + file map + draft + **plan self-review** + **user review** of \`plan.md\`, matching the skill’s *Self-Review* and *No Placeholders* bars)
   - Readiness gate (\`plan_self_review_passed\` + step 7 user approval)

4. Use \`template\` from the JSON as the structure. Apply \`context\` and \`rules\` as constraints — do NOT copy them into the artifact.

5. Write the plan to \`outputPath\` (\`openspec/changes/<name>/plan.md\`).

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}

${BRAINSTORM_ROOT_GATE_POLICY_BLOCK}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`;

export function getBrainstormRootWritingPlansSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-writing-plans',
    description: 'Create plan.md for a brainstorm-root change using superpowers:writing-plans.',
    instructions: WRITING_PLANS_THIN_BODY(
      "The user's request may name a change (kebab-case) or rely on session context; resolve the active change before drafting the plan."
    ),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '2.0' },
  };
}

export function getOpsxBrainstormRootWritingPlansCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Writing Plans',
    description: 'Generate plan.md for a brainstorm-root change',
    category: 'Workflow',
    tags: ['workflow', 'planning', 'plan'],
    content: WRITING_PLANS_THIN_BODY(
      'The argument after `/opsx:writing-plans` is the change name (kebab-case), if provided; otherwise infer from session context.'
    ),
  };
}
