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
        const normalized = runtime.replace(/\s+/g, ' ');

        expect(runtime, workflowId).toContain('Choice guidance:');
        expect(runtime, workflowId).toContain('exactly one option as `(Recommended)`');
        expect(runtime, workflowId).toContain('briefly explain why');
        expect(runtime, workflowId).toContain('ask one focused clarifying question');
        expect(runtime, workflowId).toContain('Never guess');
        expect(normalized, workflowId).toContain('Do not target a minimum or default option count');
        expect(normalized, workflowId).toContain('When only one approach is genuinely viable, present it directly');
        expect(normalized, workflowId).toContain('Only when two or more genuinely viable options remain');
        expect(normalized, workflowId).toContain('concrete advantages and disadvantages for every presented approach');
        expect(normalized, workflowId).toContain('Do not invent benefits or drawbacks');
        expect(normalized, workflowId).toContain('the user chooses becomes authoritative');
        expect(normalized, workflowId).toContain('ask the user to decide again before changing direction');
        expect(normalized, workflowId).not.toContain('Compare two or three viable approaches');
      }
    }

    for (const workflowId of ['new', 'propose', 'writing-plans', 'apply', 'archive']) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
      const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';
      expect(skill, workflowId).not.toContain('Choice guidance:');
      expect(command, workflowId).not.toContain('Choice guidance:');
    }
  });

  it('applies choice guidance before the first question', () => {
    const questionMarkerByWorkflow = {
      brainstorm: 'Ask one clarifying question',
      update: 'Ask focused questions',
    } as const;

    for (const workflowId of ['brainstorm', 'update'] as const) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
      const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';

      for (const runtime of [skill, command]) {
        const policyIndex = runtime.indexOf('Choice guidance:');
        const questionIndex = runtime.indexOf(questionMarkerByWorkflow[workflowId]);

        expect(runtime, workflowId).toContain('Apply this guidance from the first question onward');
        expect(policyIndex, workflowId).toBeGreaterThanOrEqual(0);
        expect(questionIndex, workflowId).toBeGreaterThanOrEqual(0);
        expect(policyIndex, workflowId).toBeLessThan(questionIndex);
      }
    }
  });
});
