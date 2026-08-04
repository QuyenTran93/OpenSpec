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

  it('recommends one contextually justified option for every multiple-choice question', () => {
    for (const workflowId of ['brainstorm', 'update']) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
      const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';

      for (const runtime of [skill, command]) {
        expect(runtime, workflowId).toContain('Multiple-choice guidance:');
        expect(runtime, workflowId).toContain('exactly one option as `(Recommended)`');
        expect(runtime, workflowId).toContain('briefly explain why');
        expect(runtime, workflowId).toContain('ask one focused clarifying question');
        expect(runtime, workflowId).toContain('Never guess');
        expect(runtime, workflowId).toContain('does not select it for the user');
      }
    }

    for (const workflowId of ['new', 'propose', 'writing-plans', 'apply', 'archive']) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
      const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';
      expect(skill, workflowId).not.toContain('Multiple-choice guidance:');
      expect(command, workflowId).not.toContain('Multiple-choice guidance:');
    }
  });
});
