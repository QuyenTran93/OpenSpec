import { describe, expect, it } from 'vitest';
import { getCommandTemplates, getSkillTemplates } from '../../../../src/core/shared/skill-generation.js';

describe('brainstorm update workflow', () => {
  it('selects a native planning-only update variant', () => {
    const skill = getSkillTemplates(['update'], 'brainstorm')[0]?.template.instructions ?? '';
    const command = getCommandTemplates(['update'], 'brainstorm')[0]?.template.content ?? '';
    const runtime = `${skill}\n${command}`;

    expect(runtime).toContain('brainstorm.md → tasks.md → plan.md');
    expect(runtime).toContain('Never edit production code');
    expect(runtime).toContain('Preserve completed checkboxes');
    expect(runtime).not.toMatch(/superpowers:/i);
  });
});
