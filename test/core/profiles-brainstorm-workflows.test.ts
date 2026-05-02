import { describe, it, expect } from 'vitest';
import { ensureWritingPlansWhenBrainstormSelected } from '../../src/core/profiles.js';

describe('ensureWritingPlansWhenBrainstormSelected', () => {
  it('returns same list when brainstorm is absent', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['new', 'apply'])).toEqual(['new', 'apply']);
  });

  it('appends writing-plans when brainstorm is present and writing-plans missing', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['brainstorm', 'new']).sort()).toEqual(
      ['brainstorm', 'new', 'writing-plans'].sort()
    );
  });

  it('does not duplicate writing-plans', () => {
    expect(ensureWritingPlansWhenBrainstormSelected(['brainstorm', 'writing-plans'])).toEqual([
      'brainstorm',
      'writing-plans',
    ]);
  });
});
