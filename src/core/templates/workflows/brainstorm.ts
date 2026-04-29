import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: 'Run brainstorm-first design flow and produce brainstorm.md before planning or implementation.',
    instructions: `Run the superpowers \`brainstorming\` skill and follow it end-to-end.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Guardrails:
- Do not implement code in this workflow.
- Capture clarified scope, constraints, and approved design decisions in the brainstorm artifact.
- If visual options are discussed, record chosen direction in the artifact.
`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBrainstormCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Brainstorm',
    description: 'Run brainstorm-first design workflow and write brainstorm.md',
    category: 'Workflow',
    tags: ['workflow', 'brainstorm', 'design'],
    content: `Use the superpowers \`brainstorming\` skill for this change.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Requirements:
- Finish design clarification before implementation.
- Do not write application code in this command.
- Ensure brainstorm decisions are captured in \`brainstorm.md\`.
`,
  };
}
