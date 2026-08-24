import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK,
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

5. Draft \`plan.md\` from the template and resolved context.

6. Write the plan to the returned resolved output path.

7. Self-review the written \`plan.md\` using the planning method below.

${BRAINSTORM_WRITING_PLANS_SHARED_BODY}

8. Fix every finding in \`plan.md\` and save the structural and content corrections.

9. Strip AI-isms from the corrected artifact and save the final prose edits:

${BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK}

10. Ask for user approval of \`plan.md\` before implementation.

${BRAINSTORM_INLINE_EXECUTION_POLICY_BLOCK}

${BRAINSTORM_FOLLOW_UP_POLICY_BLOCK}

`;

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
