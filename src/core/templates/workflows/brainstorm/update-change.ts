import type { CommandTemplate, SkillTemplate } from '../../types.js';
import {
  BRAINSTORM_FOLLOW_UP_POLICY_BLOCK,
  BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK,
} from './workflow-policy.js';

const UPDATE_BODY = (input: string): string => `Revise an existing brainstorm change while keeping planning artifacts coherent.

${BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK}

${BRAINSTORM_FOLLOW_UP_POLICY_BLOCK}

**Input:** ${input}

1. Resolve the change once with \`openspec status --change "<name>" --json\`.
   Preserve an explicit \`--store <id>\` on every follow-up.
2. Read existing artifacts from \`artifactPaths.<id>.existingOutputPaths\`.
3. Ask focused questions about the requested revision.
4. Reconcile planning artifacts in dependency order:
   \`brainstorm.md → tasks.md → plan.md\`.
5. Preserve completed checkboxes when task meaning is unchanged. If revised
   scope conflicts with completed work, retain it and ask the user to resolve it.
6. Recheck scope, consistency, paths, tests, and verification steps after edits.

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
