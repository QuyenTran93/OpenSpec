import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
} from './superpowers-openspec-mapping.js';

export function getBrainstormRootBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md under the active OpenSpec change.',
    instructions: `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:brainstorming\` appears in your available skills list. If missing, STOP and inform the user that the Superpowers plugin must be installed (or that they can explicitly opt to write \`brainstorm.md\` manually using the template below). Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:brainstorming**.

Follow the skill’s interactive phases (see the numbered list under **Superpowers → OpenSpec** below). Per OpenSpec brainstorm-root, **do not** invoke \`writing-plans\` inside this skill; persist to this change’s \`brainstorm.md\`, add \`design.md\` only when optional per that body. After approval, hand off to **propose / continue**, not apply, until propose/continue has produced the upstream schema artifacts.

---

**Input**: The user's request may include a change name (kebab-case) or a description of the work; if unclear, resolve the active change using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBrainstormRootBrainstormCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Brainstorm',
    description: 'Run brainstorm-first design workflow and write brainstorm.md for a change',
    category: 'Workflow',
    tags: ['workflow', 'brainstorm', 'design'],
    content: `PRECHECK — required skill availability:
Before invoking, confirm \`superpowers:brainstorming\` appears in your available skills list. If missing, STOP and inform the user that the Superpowers plugin must be installed (or that they can explicitly opt to write \`brainstorm.md\` manually using the template below). Do NOT silently fall back.

Use the Skill tool to invoke **superpowers:brainstorming**.

Follow the interactive phases (numbered list under **Superpowers → OpenSpec** below). **Do not** run \`/opsx:writing-plans\` or \`/opsx:apply\` from this command; persist to \`brainstorm.md\`, add optional \`design.md\` only when warranted. Hand off to \`/opsx:propose\` or \`/opsx:continue\` after approval until upstream schema artifacts are complete.

---

**Input**: The argument after \`/opsx:brainstorm\` is the change name (kebab-case), if provided; otherwise infer from session context using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`,
  };
}
