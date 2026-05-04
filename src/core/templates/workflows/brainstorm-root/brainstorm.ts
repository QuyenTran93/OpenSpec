import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY,
  BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK,
} from './superpowers-openspec-mapping.js';

export function getBrainstormRootBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md under the active OpenSpec change.',
    instructions: `Run the superpowers \`brainstorming\` skill and follow it end-to-end through user-approved design in \`brainstorm.md\`, then hand off to propose — not to \`writing-plans\` or apply until propose/continue has finished the schema artifacts.

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
    content: `Use the superpowers \`brainstorming\` skill through user-approved design in \`brainstorm.md\`, then hand off to \`/opsx:propose\` or \`/opsx:continue\` — not to \`/opsx:writing-plans\` or \`/opsx:apply\` until schema artifacts are complete.

---

**Input**: The argument after \`/opsx:brainstorm\` is the change name (kebab-case), if provided; otherwise infer from session context using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}

${BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK}`,
  };
}
