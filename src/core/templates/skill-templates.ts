/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

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
  getBrainstormRootBrainstormSkillTemplate,
  getOpsxBrainstormRootBrainstormCommandTemplate,
  getBrainstormRootProposeSkillTemplate,
  getOpsxBrainstormRootProposeCommandTemplate,
  getBrainstormRootWritingPlansSkillTemplate,
  getOpsxBrainstormRootWritingPlansCommandTemplate,
  getBrainstormRootContinueChangeSkillTemplate,
  getOpsxBrainstormRootContinueCommandTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
  getBrainstormRootNewChangeSkillTemplate,
  getOpsxBrainstormRootNewCommandTemplate,
  getBrainstormRootArchiveChangeSkillTemplate,
  getOpsxBrainstormRootArchiveCommandTemplate,
} from './workflows/brainstorm-root/index.js';
