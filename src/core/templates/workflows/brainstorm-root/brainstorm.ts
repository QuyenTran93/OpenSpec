import type { SkillTemplate, CommandTemplate } from '../../types.js';
import { BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY } from './superpowers-openspec-mapping.js';

export function getBrainstormRootBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md under the active OpenSpec change.',
    instructions: `Run the superpowers \`brainstorming\` skill and follow it end-to-end before planning or implementation.

---

**Input**: The user's request may include a change name (kebab-case) or a description of the work; if unclear, resolve the active change using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}`,
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
    content: `Use the superpowers \`brainstorming\` skill and complete brainstorming before any implementation work.

---

**Input**: The argument after \`/opsx:brainstorm\` is the change name (kebab-case), if provided; otherwise infer from session context using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}`,
  };
}
