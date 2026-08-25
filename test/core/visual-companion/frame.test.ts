import { describe, expect, it } from 'vitest';
import { VISUAL_FRAME } from '../../../src/core/visual-companion/frame.js';

describe('visual companion frame', () => {
  it('provides a centered full-width canvas without a default sidebar', () => {
    const frame = VISUAL_FRAME('<div data-choice="overview">Overview</div>', '/helper.js');

    expect(frame).toContain('.canvas');
    expect(frame).toContain('width:100%');
    expect(frame).toContain('margin:0 auto');
    expect(frame).not.toContain('grid-template-columns:240px 1fr');
  });
});
