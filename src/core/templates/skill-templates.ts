/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOpsxExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOpsxNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOpsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyChangeSkillTemplate, getOpsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getUpdateChangeSkillTemplate, getOpsxUpdateCommandTemplate } from './workflows/update-change.js';
export { getFfChangeSkillTemplate, getOpsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOpsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOpsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOpsxBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOpsxVerifyCommandTemplate } from './workflows/verify-change.js';
export { getOnboardSkillTemplate, getOpsxOnboardCommandTemplate } from './workflows/onboard.js';
export { getOpsxProposeSkillTemplate, getOpsxProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
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
  getBrainstormRootApplyChangeSkillTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
  getBrainstormRootNewChangeSkillTemplate,
  getOpsxBrainstormRootNewCommandTemplate,
  getBrainstormRootArchiveChangeSkillTemplate,
  getOpsxBrainstormRootArchiveCommandTemplate,
} from './workflows/brainstorm-root/index.js';
