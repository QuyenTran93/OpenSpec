import { describe, expect, it } from 'vitest';
import { sanitizeVisualFragment } from '../../../src/core/visual-companion/sanitize.js';

describe('sanitizeVisualFragment', () => {
  it('removes executable and remote content while preserving choices', () => {
    const result = sanitizeVisualFragment(`
      <script>alert(1)</script>
      <button data-choice="a" onclick="steal()">Choose</button>
      <img src="https://tracker.example/x.png">
      <a href="javascript:steal()">bad</a>
    `);
    expect(result).not.toMatch(/script|onclick|tracker\.example|javascript:/i);
    expect(result).toContain('data-choice="a"');
    expect(result).toContain('Choose');
  });
});
