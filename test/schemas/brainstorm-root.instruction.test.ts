import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { resolveSchema } from '../../src/core/artifact-graph/resolver.js';

describe('brainstorm-root schema instruction (canonical content, v2)', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const schema = resolveSchema('brainstorm-root', projectRoot);

  describe('schema shape', () => {
    it('has only one artifact (tasks)', () => {
      expect(schema.artifacts.map((a) => a.id)).toEqual(['tasks']);
    });

    it('declares brainstorm and plan top-level phases', () => {
      expect(schema.brainstorm?.generates).toBe('brainstorm.md');
      expect(schema.plan?.generates).toBe('plan.md');
    });

    it('apply requires both tasks and plan, with executionPlan plan.md', () => {
      expect(schema.apply?.requires).toEqual(['tasks', 'plan']);
      expect(schema.apply?.executionPlan).toBe('plan.md');
    });

    it('schema version is bumped to 2', () => {
      expect(schema.version).toBe(2);
    });
  });

  describe('artifacts[id=tasks].instruction', () => {
    const tasksInstr = schema.artifacts.find((a) => a.id === 'tasks')?.instruction ?? '';

    it('directs reading brainstorm.md as input', () => {
      expect(tasksInstr).toContain('brainstorm.md');
    });

    it('mentions reconcile semantics on rerun', () => {
      expect(tasksInstr.toLowerCase()).toMatch(/reconcile|re-?invocation|preserve/);
    });

    it('preserves checkbox format guidance', () => {
      expect(tasksInstr).toContain('- [ ]');
    });
  });

  describe('brainstorm.instruction', () => {
    const bInstr = schema.brainstorm?.instruction ?? '';

    it('mentions superpowers:brainstorming PRECHECK', () => {
      expect(bInstr).toContain('superpowers:brainstorming');
    });

    it('redirects output to change dir, not docs/superpowers/specs/', () => {
      expect(bInstr).toContain('docs/superpowers/specs/');
    });

    it('contains interactive flow + readiness gate markers', () => {
      expect(bInstr.toLowerCase()).toContain('interactive');
      expect(bInstr).toContain('Readiness gate');
      expect(bInstr).toContain('all_questions_resolved');
      expect(bInstr).toContain('design_approved');
    });

    it('embeds spec self-review checklist aligned with superpowers:brainstorming', () => {
      expect(bInstr).toContain('Spec self-review');
      expect(bInstr).toContain('Placeholder scan');
      expect(bInstr).toContain('Internal consistency');
      expect(bInstr).toContain('Scope check');
      expect(bInstr).toContain('Ambiguity check');
      expect(bInstr).toContain('spec_self_review_passed');
    });

    it('requires user review of brainstorm.md before propose handoff', () => {
      expect(bInstr).toContain('User review gate');
      expect(bInstr).toContain('user_acknowledged_brainstorm');
    });

    it('hands off to /opsx:propose, not writing-plans/apply', () => {
      expect(bInstr).toContain('/opsx:propose');
    });
  });

  describe('plan.instruction', () => {
    const pInstr = schema.plan?.instruction ?? '';

    it('mentions superpowers:writing-plans PRECHECK', () => {
      expect(pInstr).toContain('superpowers:writing-plans');
    });

    it('writes to plan.md, not execution-plan.md or docs/superpowers/plans/', () => {
      expect(pInstr).toContain('plan.md');
      expect(pInstr).toContain('docs/superpowers/plans/');
    });

    it('reads brainstorm.md and tasks.md as inputs', () => {
      expect(pInstr).toContain('brainstorm.md');
      expect(pInstr).toContain('tasks.md');
    });

    it('embeds plan self-review aligned with superpowers:writing-plans', () => {
      expect(pInstr).toContain('Plan self-review');
      expect(pInstr).toContain('Spec coverage');
      expect(pInstr).toContain('Placeholder scan');
      expect(pInstr).toContain('Type / name consistency');
      expect(pInstr).toContain('plan_self_review_passed');
    });

    it('requires user review of plan.md before apply handoff', () => {
      expect(pInstr).toContain('User review gate');
      expect(pInstr).toContain('user_acknowledged_plan');
    });

    it('delegates execution mode to apply, not the plan phase', () => {
      expect(pInstr).toContain('Do **not** choose execution mode');
      expect(pInstr).toContain('owns that policy');
    });
  });

  describe('apply.instruction (preserved from v1)', () => {
    const aInstr = schema.apply?.instruction ?? '';

    it('mentions subagent-driven-development executor', () => {
      expect(aInstr).toContain('superpowers:subagent-driven-development');
    });

    it('mentions transitive TDD and code-review skills', () => {
      expect(aInstr).toContain('superpowers:test-driven-development');
      expect(aInstr).toContain('superpowers:requesting-code-review');
    });

    it('rejects executing-plans fallback', () => {
      expect(aInstr).toContain('superpowers:executing-plans');
    });

    it('mentions inline opt-in policy', () => {
      expect(aInstr).toContain('inline');
    });

    it('mentions git commit defaulting policy', () => {
      expect(aInstr).toContain('git commit');
    });

    it('mentions using-git-worktrees defaulting policy', () => {
      expect(aInstr).toContain('using-git-worktrees');
    });

    it('contains canonical Use-the-Skill-tool phrase on a single line', () => {
      expect(aInstr).toContain(
        'Use the Skill tool to invoke **superpowers:subagent-driven-development**'
      );
    });
  });
});
