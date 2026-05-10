/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import type { Profile } from '../global-config.js';
import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  getBrainstormRootBrainstormSkillTemplate,
  getBrainstormRootWritingPlansSkillTemplate,
  getBrainstormRootProposeSkillTemplate,
  getBrainstormRootNewChangeSkillTemplate,
  getBrainstormRootApplyChangeSkillTemplate,
  getBrainstormRootArchiveChangeSkillTemplate,
  getOpsxBrainstormRootBrainstormCommandTemplate,
  getOpsxBrainstormRootWritingPlansCommandTemplate,
  getOpsxBrainstormRootProposeCommandTemplate,
  getOpsxBrainstormRootNewCommandTemplate,
  getOpsxBrainstormRootApplyCommandTemplate,
  getOpsxBrainstormRootArchiveCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

function isBrainstormProfile(profile: Profile): boolean {
  return profile === 'brainstorm';
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 * @param profile - Template variant (`brainstorm` uses brainstorm-root overlapping workflows)
 */
export function getSkillTemplates(
  workflowFilter?: readonly string[],
  profile: Profile = 'core'
): SkillTemplateEntry[] {
  const brainstorm = isBrainstormProfile(profile);
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore', workflowId: 'explore' },
    {
      template: brainstorm ? getBrainstormRootNewChangeSkillTemplate() : getNewChangeSkillTemplate(),
      dirName: 'openspec-new-change',
      workflowId: 'new',
    },
    // brainstorm-root v2 dropped the continue-change command (single-artifact
    // workflow makes it redundant). For other profiles (e.g., spec-driven),
    // continue-change is still emitted.
    ...(brainstorm
      ? []
      : [
          {
            template: getContinueChangeSkillTemplate(),
            dirName: 'openspec-continue-change',
            workflowId: 'continue',
          },
        ]),
    {
      template: brainstorm ? getBrainstormRootApplyChangeSkillTemplate() : getApplyChangeSkillTemplate(),
      dirName: 'openspec-apply-change',
      workflowId: 'apply',
    },
    { template: getFfChangeSkillTemplate(), dirName: 'openspec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'openspec-sync-specs', workflowId: 'sync' },
    {
      template: brainstorm ? getBrainstormRootArchiveChangeSkillTemplate() : getArchiveChangeSkillTemplate(),
      dirName: 'openspec-archive-change',
      workflowId: 'archive',
    },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'openspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'openspec-verify-change', workflowId: 'verify' },
    { template: getOnboardSkillTemplate(), dirName: 'openspec-onboard', workflowId: 'onboard' },
    {
      template: brainstorm ? getBrainstormRootProposeSkillTemplate() : getOpsxProposeSkillTemplate(),
      dirName: 'openspec-propose',
      workflowId: 'propose',
    },
    { template: getBrainstormRootBrainstormSkillTemplate(), dirName: 'openspec-brainstorm', workflowId: 'brainstorm' },
    {
      template: getBrainstormRootWritingPlansSkillTemplate(),
      dirName: 'openspec-writing-plans',
      workflowId: 'writing-plans',
    },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 * @param profile - Template variant (`brainstorm` uses brainstorm-root overlapping workflows)
 */
export function getCommandTemplates(
  workflowFilter?: readonly string[],
  profile: Profile = 'core'
): CommandTemplateEntry[] {
  const brainstorm = isBrainstormProfile(profile);
  const all: CommandTemplateEntry[] = [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    {
      template: brainstorm ? getOpsxBrainstormRootNewCommandTemplate() : getOpsxNewCommandTemplate(),
      id: 'new',
    },
    ...(brainstorm
      ? []
      : [
          {
            template: getOpsxContinueCommandTemplate(),
            id: 'continue',
          },
        ]),
    {
      template: brainstorm ? getOpsxBrainstormRootApplyCommandTemplate() : getOpsxApplyCommandTemplate(),
      id: 'apply',
    },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    {
      template: brainstorm ? getOpsxBrainstormRootArchiveCommandTemplate() : getOpsxArchiveCommandTemplate(),
      id: 'archive',
    },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
    {
      template: brainstorm ? getOpsxBrainstormRootProposeCommandTemplate() : getOpsxProposeCommandTemplate(),
      id: 'propose',
    },
    { template: getOpsxBrainstormRootBrainstormCommandTemplate(), id: 'brainstorm' },
    { template: getOpsxBrainstormRootWritingPlansCommandTemplate(), id: 'writing-plans' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 * @param profile - Template variant (`brainstorm` uses brainstorm-root overlapping workflows)
 */
export function getCommandContents(
  workflowFilter?: readonly string[],
  profile: Profile = 'core'
): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter, profile);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
