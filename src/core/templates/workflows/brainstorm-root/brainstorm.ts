import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_GATE_POLICY_BLOCK,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
} from './superpowers-openspec-mapping.js';

const BRAINSTORM_THIN_BODY_TEMPLATE = (
  argDescription: string,
  invokeNote: string
): string => `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:brainstorming\` appears in your available skills list. If missing, STOP and inform the user that the Superpowers plugin must be installed (or that they can explicitly opt to write \`brainstorm.md\` manually). Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:brainstorming**.

---

**Input**: ${argDescription}

**Steps**

1. Resolve the active change name. If no change exists yet, run:
   \`\`\`bash
   openspec new change "<name>" --schema brainstorm-root
   \`\`\`

2. Get phase instructions from the schema (canonical source-of-truth):
   \`\`\`bash
   openspec instructions brainstorm --change "<name>" --schema brainstorm-root --json
   \`\`\`

3. Follow the returned \`instruction\` field exactly. It contains:
   - PRECHECK and skill-tool invocation directives
   - Output redirection rules (write to \`openspec/changes/<name>/brainstorm.md\`, never \`docs/superpowers/specs/\`)
   - Interactive brainstorming flow (steps 1–7), including **spec self-review** and **user review** of \`brainstorm.md\` (same quality bar as **superpowers:brainstorming**; see schema for the checklist)
   - Readiness gate (includes \`spec_self_review_passed\` and \`user_acknowledged_brainstorm\` after steps 6–7)
   - Guardrail: no silent scaffolding

4. Use \`template\` from the JSON as the structure for \`brainstorm.md\`. Apply \`context\` and \`rules\` as constraints — do NOT copy them into the artifact.

5. Write the approved outcome to \`outputPath\` (\`openspec/changes/<name>/brainstorm.md\`). ${invokeNote}

After approved brainstorm content is captured, hand off to \`/opsx:propose\` (which generates \`tasks.md\`) — not directly to \`/opsx:writing-plans\` or \`/opsx:apply\`.

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
