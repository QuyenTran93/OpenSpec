import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  getArchiveChangeSkillTemplate,
  getOpsxArchiveCommandTemplate,
} from '../spec-driven/archive-change.js';

export function getBrainstormArchiveChangeSkillTemplate(): SkillTemplate {
  return getArchiveChangeSkillTemplate();
}

export function getOpsxBrainstormArchiveCommandTemplate(): CommandTemplate {
  return getOpsxArchiveCommandTemplate();
}
