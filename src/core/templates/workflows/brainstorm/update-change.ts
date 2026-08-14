import type { CommandTemplate, SkillTemplate } from '../../types.js';
import {
  BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK,
  BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK,
  BRAINSTORM_FOLLOW_UP_POLICY_BLOCK,
  BRAINSTORM_VISUAL_DESIGN_POLICY_BLOCK,
  BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK,
} from './workflow-policy.js';

const UPDATE_BODY = (input: string): string => `Revise an existing brainstorm change while keeping planning artifacts coherent.

${BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK}

${BRAINSTORM_VISUAL_DESIGN_POLICY_BLOCK}

${BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK}

${BRAINSTORM_FOLLOW_UP_POLICY_BLOCK}

**Input:** ${input}

1. Resolve the change once with \`openspec status --change "<name>" --json\`.
   Preserve an explicit \`--store <id>\` on every follow-up.
2. Read existing artifacts from \`artifactPaths.<id>.existingOutputPaths\`.
3. Ask focused questions about the requested revision.
4. Reconcile and write existing planning artifacts in dependency order:
   \`brainstorm.md → tasks.md → plan.md\`.
   Preserve completed checkboxes when task meaning is unchanged. If revised
   scope conflicts with completed work, retain it and ask the user to resolve it.
5. Self-review the written artifacts for scope, dependency consistency, resolved
   paths, tests, and verification steps.
6. Fix every finding in the artifacts and save the structural and content corrections.
7. Strip AI-isms from the corrected artifacts and save the final prose edits:

${BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK}

Never edit production code or mark implementation work complete. Never create a
missing downstream artifact as a side effect; recommend the appropriate
brainstorm, propose, or writing-plans workflow instead.`;

export function getBrainstormUpdateChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-update-change',
    description: 'Reconcile brainstorm planning artifacts without implementing code.',
    instructions: UPDATE_BODY('Optionally name the active change and requested revision.'),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBrainstormUpdateCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Update',
    description: 'Reconcile brainstorm planning artifacts',
    category: 'Workflow',
    tags: ['workflow', 'update', 'brainstorm'],
    content: UPDATE_BODY('The optional argument is the active change name.'),
  };
}
