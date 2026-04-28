import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_GATE_POLICY_BLOCK,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
} from './superpowers-openspec-mapping.js';

const BRAINSTORM_THIN_BODY_TEMPLATE = (
  argDescription: string,
  invokeNote: string
): string => `PRECHECK: \`superpowers:brainstorming\` must be available; else STOP (plugin or manual \`brainstorm.md\`). Invoke it via the Skill tool.

---

**Input**: ${argDescription}

**Steps**

1. Resolve change name; if none: \`openspec new change "<name>" --schema brainstorm-root\`

2. Canonical instructions (do not paraphrase — avoids duplicating long schema text in context):
   \`\`\`bash
   openspec instructions brainstorm --change "<name>" --schema brainstorm-root --json
   \`\`\`
   Follow \`instruction\` exactly (steps 1–7, gates, guardrails). Self-review = edit \`brainstorm.md\` in place; never paste the checklist as artifact prose.

3. Use JSON \`template\` for structure; apply \`context\`/\`rules\` — do not copy them into the file.

4. Write to \`outputPath\` (\`openspec/changes/<name>/brainstorm.md\`). ${invokeNote}

Then \`/opsx:propose\` → \`tasks.md\` (not writing-plans/apply direct).

${BRAINSTORM_ROOT_GATE_POLICY_BLOCK}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`;

export function getBrainstormRootBrainstormSkillTemplate(): SkillTemplate {
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

export function getOpsxBrainstormRootBrainstormCommandTemplate(): CommandTemplate {
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
