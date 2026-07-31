import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_GATE_POLICY_BLOCK,
  BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK,
} from './workflow-policy.js';
import { NATIVE_BRAINSTORM_METHOD } from './native-discipline.js';

const BRAINSTORM_THIN_BODY_TEMPLATE = (
  argDescription: string,
  invokeNote: string
): string => `${NATIVE_BRAINSTORM_METHOD}

**Input**: ${argDescription}

**Steps**

1. Resolve change name; if none: \`openspec new change "<name>" --schema brainstorm\`

2. Canonical instructions (do not paraphrase — avoids duplicating long schema text in context):
   \`\`\`bash
   openspec instructions brainstorm --change "<name>" --schema brainstorm --json
   \`\`\`
   Follow \`instruction\` and use the resolved paths it returns.

3. Use JSON \`template\` for structure; apply \`context\`/\`rules\` — do not copy them into the file.

4. Write to the returned \`resolvedOutputPath\` (or \`outputPath\` relative to the returned change directory). ${invokeNote}

Then \`/opsx:propose\` → \`tasks.md\` (not writing-plans/apply direct).

${BRAINSTORM_GATE_POLICY_BLOCK}

${BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK}`;

export function getBrainstormBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md under the active OpenSpec change.',
    instructions: BRAINSTORM_THIN_BODY_TEMPLATE(
      "The user's request may include a change name (kebab-case) or a description of the work; if unclear, resolve the active change.",
      'Hand off to `/opsx:propose` to generate or reconcile `tasks.md` once brainstorm is captured.'
    ),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.2' },
  };
}

export function getOpsxBrainstormBrainstormCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Brainstorm',
    description: 'Run brainstorm-first design workflow and write brainstorm.md for a change',
    category: 'Workflow',
    tags: ['workflow', 'brainstorm', 'design'],
    content: BRAINSTORM_THIN_BODY_TEMPLATE(
      'The argument after `/opsx:brainstorm` is the change name (kebab-case), if provided; otherwise infer from session context.',
      'Hand off to `/opsx:propose` to generate or reconcile `tasks.md` once brainstorm is captured.'
    ),
  };
}
