import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { resolveSchema } from '../../src/core/artifact-graph/resolver.js';

describe('brainstorm-root schema instruction (canonical content)', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const schema = resolveSchema('brainstorm-root', projectRoot);

  describe('artifacts[id=brainstorm].instruction', () => {
    const brainstormInstr = schema.artifacts.find((a) => a.id === 'brainstorm')?.instruction ?? '';

    it('mentions superpowers:brainstorming PRECHECK', () => {
      expect(brainstormInstr).toContain('superpowers:brainstorming');
    });

    it('redirects output away from docs/superpowers/specs/', () => {
      expect(brainstormInstr).toContain('docs/superpowers/specs/');
    });

    it('contains interactive flow marker', () => {
      expect(brainstormInstr).toContain('Interactive brainstorming flow');
    });

    it('contains readiness gate markers', () => {
      expect(brainstormInstr).toContain('Readiness gate');
      expect(brainstormInstr).toContain('all_questions_resolved');
      expect(brainstormInstr).toContain('design_approved');
    });
  });

  describe('apply.instruction', () => {
    const applyInstr = schema.apply?.instruction ?? '';

    it('mentions subagent-driven-development executor', () => {
      expect(applyInstr).toContain('superpowers:subagent-driven-development');
    });

    it('mentions transitive TDD and code-review skills', () => {
      expect(applyInstr).toContain('superpowers:test-driven-development');
      expect(applyInstr).toContain('superpowers:requesting-code-review');
    });

    it('rejects executing-plans fallback', () => {
      expect(applyInstr).toContain('superpowers:executing-plans');
    });

    it('mentions execution-plan.md gate', () => {
      expect(applyInstr).toContain('execution-plan.md');
    });

    it('mentions inline opt-in policy', () => {
      expect(applyInstr).toContain('inline');
    });

    it('mentions git commit defaulting policy', () => {
      expect(applyInstr).toContain('git commit');
    });

    it('mentions using-git-worktrees defaulting policy (post-harmonization)', () => {
      expect(applyInstr).toContain('using-git-worktrees');
    });

    it('contains canonical Use-the-Skill-tool phrase on a single line (post-harmonization)', () => {
      expect(applyInstr).toContain(
        'Use the Skill tool to invoke **superpowers:subagent-driven-development**'
      );
    });
  });
});
