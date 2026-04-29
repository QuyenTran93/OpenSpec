import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getWritingPlansSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-writing-plans',
    description: 'Create a concrete execution plan from approved design artifacts.',
    instructions: `Run the superpowers \`writing-plans\` skill using the approved design/spec artifacts.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/execution-plan.md\`

Requirements:
- Keep tasks executable and testable with explicit file paths.
- Include verification steps and expected outcomes.
- Do not start implementation in this workflow.
`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxWritingPlansCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Writing Plans',
    description: 'Generate an execution plan and write execution-plan.md',
    category: 'Workflow',
    tags: ['workflow', 'planning', 'execution-plan'],
    content: `Use the superpowers \`writing-plans\` skill for the active change.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/execution-plan.md\`

Requirements:
- Keep the plan actionable with concrete steps and verification commands.
- Ensure the plan is complete before \`/opsx:apply\`.
`,
  };
}
