/**
 * Profile System
 *
 * Defines workflow profiles that control which workflows are installed.
 * Profiles determine WHICH workflows; delivery (in global config) determines HOW.
 */

import type { Profile } from './global-config.js';

/**
 * Core workflows included in the 'core' profile.
 * These provide the streamlined experience for new users.
 */
export const CORE_WORKFLOWS = ['propose', 'explore', 'apply', 'update', 'sync', 'archive'] as const;
export const CORE_WORKFLOWS = ['propose', 'explore', 'apply', 'archive'] as const;
// brainstorm-root v2 dropped the `continue` workflow; tasks.md is generated/
// reconciled by `propose`, plan.md by `writing-plans`.
export const BRAINSTORM_WORKFLOWS = ['propose', 'brainstorm', 'new', 'writing-plans', 'apply', 'archive'] as const;

/**
 * All available workflows in the system.
 */
export const ALL_WORKFLOWS = [
  'propose',
  'explore',
  'new',
  'continue',
  'apply',
  'update',
  'ff',
  'sync',
  'archive',
  'bulk-archive',
  'verify',
  'onboard',
  'brainstorm',
  'writing-plans',
] as const;

export type WorkflowId = (typeof ALL_WORKFLOWS)[number];
export type CoreWorkflowId = (typeof CORE_WORKFLOWS)[number];

/**
 * Resolves which workflows should be active for a given profile configuration.
 *
 * - 'core' profile always returns CORE_WORKFLOWS
 * - 'custom' profile returns the provided customWorkflows, or empty array if not provided
 */
export function getProfileWorkflows(
  profile: Profile,
  customWorkflows?: string[]
): readonly string[] {
  if (profile === 'custom') {
    return customWorkflows ?? [];
  }
  if (profile === 'brainstorm') {
    return BRAINSTORM_WORKFLOWS;
  }
  return CORE_WORKFLOWS;
}

/**
 * When the user enables brainstorm but did not pick writing-plans, add writing-plans.
 * Preset brainstorm already includes both workflows.
 */
export function ensureWritingPlansWhenBrainstormSelected(workflows: readonly string[]): string[] {
  if (!workflows.includes('brainstorm')) {
    return [...workflows];
  }
  if (workflows.includes('writing-plans')) {
    return [...workflows];
  }
  return [...workflows, 'writing-plans'];
}
