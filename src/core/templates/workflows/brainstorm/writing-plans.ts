import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK,
  BRAINSTORM_GATE_POLICY_BLOCK,
  BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK,
  BRAINSTORM_WRITING_PLANS_SHARED_BODY,
  BRAINSTORM_INLINE_EXECUTION_POLICY_BLOCK,
  BRAINSTORM_FOLLOW_UP_POLICY_BLOCK,
} from './workflow-policy.js';

const WRITING_PLANS_THIN_BODY = (argDescription: string): string => `**Input**: ${argDescription}

**Steps**

1. Resolve the active change name (existing logic).

2. Get artifact instructions from the schema:
   \`\`\`bash
   openspec instructions plan --change "<name>" --schema brainstorm --json
   \`\`\`

3. Follow the returned \`instruction\` field and resolved paths.

4. Use \`template\` from the JSON as the structure. Apply \`context\` and \`rules\` as constraints — do NOT copy them into the artifact.

${BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK}

5. Write the plan to the returned resolved output path.

${BRAINSTORM_WRITING_PLANS_SHARED_BODY}

${BRAINSTORM_INLINE_EXECUTION_POLICY_BLOCK}

${BRAINSTORM_FOLLOW_UP_POLICY_BLOCK}

${BRAINSTORM_GATE_POLICY_BLOCK}

${BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK}`;

export function getBrainstormWritingPlansSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-writing-plans',
    description: 'Create a concrete, reviewed plan.md for a brainstorm change.',
    instructions: WRITING_PLANS_THIN_BODY(
      "The user's request may name a change (kebab-case) or rely on session context; resolve the active change before drafting the plan."
    ),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '2.0' },
  };
}

export function getOpsxBrainstormWritingPlansCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Writing Plans',
    description: 'Generate plan.md for a brainstorm change',
    category: 'Workflow',
    tags: ['workflow', 'planning', 'plan'],
    content: WRITING_PLANS_THIN_BODY(
      'The argument after `/opsx:writing-plans` is the change name (kebab-case), if provided; otherwise infer from session context.'
    ),
  };
}
