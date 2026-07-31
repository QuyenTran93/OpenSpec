import { describe, it, expect } from 'vitest';
import { BRAINSTORM_WORKFLOWS, getProfileWorkflows } from '../../src/core/profiles.js';

describe('brainstorm profile workflows', () => {
  it('declares the complete preset explicitly, including update', () => {
    expect(BRAINSTORM_WORKFLOWS).toEqual([
      'propose',
      'brainstorm',
      'new',
      'writing-plans',
      'update',
      'apply',
      'archive',
    ]);
    expect(getProfileWorkflows('brainstorm')).toBe(BRAINSTORM_WORKFLOWS);
  });
});
