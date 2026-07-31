import type { SkillTemplate, CommandTemplate } from '../../types.js';
import { getNewChangeSkillTemplate, getOpsxNewCommandTemplate } from '../spec-driven/new-change.js';

const BRAINSTORM_HANDOFF = `

For the brainstorm profile, prefer the repository's configured schema. If no
project config exists and the user explicitly requests this profile, use
\`--schema brainstorm\`. Use the resolved planning root and change path
reported by the CLI. After creation, stop and hand off to \`/opsx:brainstorm\`;
do not create tasks or a plan yet.`;

export function getBrainstormNewChangeSkillTemplate(): SkillTemplate {
  const template = getNewChangeSkillTemplate();
  return { ...template, instructions: `${template.instructions}${BRAINSTORM_HANDOFF}` };
}

export function getOpsxBrainstormNewCommandTemplate(): CommandTemplate {
  const template = getOpsxNewCommandTemplate();
  return { ...template, content: `${template.content}${BRAINSTORM_HANDOFF}` };
}
