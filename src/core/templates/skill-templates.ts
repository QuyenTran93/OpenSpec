/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getUpdateChangeSkillTemplate, getOpsxUpdateCommandTemplate } from './workflows/update-change.js';
export {
  getExploreSkillTemplate,
  getOpsxExploreCommandTemplate,
  getNewChangeSkillTemplate,
  getOpsxNewCommandTemplate,
  getContinueChangeSkillTemplate,
  getOpsxContinueCommandTemplate,
  getApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
  getFfChangeSkillTemplate,
  getOpsxFfCommandTemplate,
  getSyncSpecsSkillTemplate,
  getOpsxSyncCommandTemplate,
  getArchiveChangeSkillTemplate,
  getOpsxArchiveCommandTemplate,
  getBulkArchiveChangeSkillTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getVerifyChangeSkillTemplate,
  getOpsxVerifyCommandTemplate,
  getOnboardSkillTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxProposeCommandTemplate,
  getFeedbackSkillTemplate,
} from './workflows/spec-driven/index.js';
export {
  getBrainstormBrainstormSkillTemplate,
  getOpsxBrainstormBrainstormCommandTemplate,
  getBrainstormProposeSkillTemplate,
  getOpsxBrainstormProposeCommandTemplate,
  getBrainstormWritingPlansSkillTemplate,
  getOpsxBrainstormWritingPlansCommandTemplate,
  getBrainstormApplyChangeSkillTemplate,
  getOpsxBrainstormApplyCommandTemplate,
  getBrainstormNewChangeSkillTemplate,
  getOpsxBrainstormNewCommandTemplate,
  getBrainstormArchiveChangeSkillTemplate,
  getOpsxBrainstormArchiveCommandTemplate,
  getBrainstormUpdateChangeSkillTemplate,
  getOpsxBrainstormUpdateCommandTemplate,
} from './workflows/brainstorm/index.js';
