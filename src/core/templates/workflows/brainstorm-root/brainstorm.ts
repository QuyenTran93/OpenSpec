import type { SkillTemplate, CommandTemplate } from '../../types.js';

export function getBrainstormRootBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md under the active OpenSpec change.',
    instructions: `Run the superpowers \`brainstorming\` skill and follow it end-to-end before planning or implementation.

Change selection rules:
- If the user already mentioned a change name, use that change.
- If the current session already has an active/recent change in scope, continue that change.
- If no clear change exists, create one first with \`openspec new change "<change-name>"\`.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Guardrails:
- Do not implement code in this workflow.
- Do not write to \`docs/superpowers/specs/\` in this workflow.
- Capture clarified scope, constraints, and approved design decisions in the brainstorm artifact.
- If visual options are discussed, record chosen direction in the artifact.
`,
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

Change selection rules:
- If the user already mentioned a change name, use that change.
- If the current session already has an active/recent change in scope, continue that change.
- If no clear change exists, create one first with \`openspec new change "<change-name>"\`.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Requirements:
- Finish design clarification before implementation.
- Do not write application code in this command.
- Do not write to \`docs/superpowers/specs/\` in this command.
- Ensure brainstorm decisions are captured in \`brainstorm.md\`.
`,
  };
}
