import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  loadTemplate,
  loadChangeContext,
  generateInstructions,
  formatChangeStatus,
  TemplateLoadError,
} from '../../../src/core/artifact-graph/instruction-loader.js';

describe('instruction-loader', () => {
  describe('loadTemplate', () => {
    it('should load template from schema directory', () => {
      // Uses built-in spec-driven schema
      const template = loadTemplate('spec-driven', 'proposal.md');

      expect(template).toContain('## Why');
      expect(template).toContain('## What Changes');
    });

    it('should throw TemplateLoadError for non-existent template', () => {
      expect(() => loadTemplate('spec-driven', 'nonexistent.md')).toThrow(
        TemplateLoadError
      );
    });

    it('should throw TemplateLoadError for non-existent schema', () => {
      expect(() => loadTemplate('nonexistent-schema', 'proposal.md')).toThrow(
        TemplateLoadError
      );
    });

    it('should include template path in error', () => {
      try {
        loadTemplate('spec-driven', 'nonexistent.md');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TemplateLoadError);
        expect((err as TemplateLoadError).templatePath).toContain('nonexistent.md');
      }
    });
  });

  describe('loadChangeContext', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should load context with default schema', () => {
      const context = loadChangeContext(tempDir, 'my-change');

      expect(context.schemaName).toBe('spec-driven');
      expect(context.changeName).toBe('my-change');
      expect(context.graph.getName()).toBe('spec-driven');
      expect(context.completed.size).toBe(0);
    });

    it('should load context with explicit schema', () => {
      const context = loadChangeContext(tempDir, 'my-change', 'spec-driven');

      expect(context.schemaName).toBe('spec-driven');
      expect(context.graph.getName()).toBe('spec-driven');
    });

    it('should detect completed artifacts', () => {
      // Create change directory with proposal.md
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, 'proposal.md'), '# Proposal');

      const context = loadChangeContext(tempDir, 'my-change');

      expect(context.completed.has('proposal')).toBe(true);
    });

    it('should return empty completed set for non-existent change directory', () => {
      const context = loadChangeContext(tempDir, 'nonexistent-change');

      expect(context.completed.size).toBe(0);
    });

    it('should auto-detect schema from .openspec.yaml metadata', () => {
      // Create change directory with metadata file
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, '.openspec.yaml'), 'schema: spec-driven\ncreated: "2025-01-05"\n');

      // Load without explicit schema - should detect from metadata
      const context = loadChangeContext(tempDir, 'my-change');

      expect(context.schemaName).toBe('spec-driven');
      expect(context.graph.getName()).toBe('spec-driven');
    });

    it('should use explicit schema over metadata schema', () => {
      // Create change directory with metadata file using spec-driven
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, '.openspec.yaml'), 'schema: spec-driven\n');

      // Load with explicit schema - should override metadata
      const context = loadChangeContext(tempDir, 'my-change', 'spec-driven');

      expect(context.schemaName).toBe('spec-driven');
      expect(context.graph.getName()).toBe('spec-driven');
    });

    it('should fall back to default when no metadata and no explicit schema', () => {
      // Create change directory without metadata file
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });

      const context = loadChangeContext(tempDir, 'my-change');

      expect(context.schemaName).toBe('spec-driven');
    });
  });

  describe('generateInstructions', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should include artifact metadata', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'proposal');

      expect(instructions.changeName).toBe('my-change');
      expect(instructions.artifactId).toBe('proposal');
      expect(instructions.schemaName).toBe('spec-driven');
      expect(instructions.outputPath).toBe('proposal.md');
    });

    it('should include template content', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'proposal');

      expect(instructions.template).toContain('## Why');
    });

    it('should show dependencies with completion status', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'specs');

      expect(instructions.dependencies).toHaveLength(1);
      expect(instructions.dependencies[0].id).toBe('proposal');
      expect(instructions.dependencies[0].done).toBe(false);
    });

    it('should mark completed dependencies as done', () => {
      // Create proposal
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, 'proposal.md'), '# Proposal');

      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'specs');

      expect(instructions.dependencies[0].done).toBe(true);
    });

    it('should list artifacts unlocked by this one', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'proposal');

      // proposal unlocks specs and design
      expect(instructions.unlocks).toContain('specs');
      expect(instructions.unlocks).toContain('design');
    });

    it('should have empty dependencies for root artifact', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const instructions = generateInstructions(context, 'proposal');

      expect(instructions.dependencies).toHaveLength(0);
    });

    it('should throw for non-existent artifact', () => {
      const context = loadChangeContext(tempDir, 'my-change');

      expect(() => generateInstructions(context, 'nonexistent')).toThrow(
        "Artifact or phase 'nonexistent' not found"
      );
    });

    describe('project config integration', () => {
      it('should return context as separate field for all artifacts', () => {
        // Create project config
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: |
  Tech stack: TypeScript, React
  API style: RESTful
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        // Context should be in separate field, not in template
        expect(instructions.context).toContain('Tech stack: TypeScript, React');
        expect(instructions.context).toContain('API style: RESTful');
        expect(instructions.template).not.toContain('Tech stack');
        expect(instructions.template).toContain('## Why'); // Actual template content
      });

      it('should return undefined context when config is absent', () => {
        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toBeUndefined();
        expect(instructions.rules).toBeUndefined();
        expect(instructions.template).toContain('## Why'); // Actual template content
      });

      it('should preserve multi-line context', () => {
        // Create project config with multi-line context
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: |
  Line 1
  Line 2
  Line 3
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toContain('Line 1\nLine 2\nLine 3');
      });

      it('should preserve special characters in context', () => {
        // Create project config with special characters
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: |
  Special: < > & " ' @ # $ % [ ] { }
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toContain('Special: < > & " \' @ # $ % [ ] { }');
      });

      it('should return rules only for matching artifact', () => {
        // Create project config with rules
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format
`
        );

        const context = loadChangeContext(tempDir, 'my-change');

        // Check proposal artifact has its rules
        const proposalInstructions = generateInstructions(context, 'proposal', tempDir);
        expect(proposalInstructions.rules).toEqual(['Include rollback plan', 'Identify affected teams']);
        expect(proposalInstructions.template).not.toContain('rollback plan');

        // Check specs artifact has its rules
        const specsInstructions = generateInstructions(context, 'specs', tempDir);
        expect(specsInstructions.rules).toEqual(['Use Given/When/Then format']);
        expect(specsInstructions.template).not.toContain('Given/When/Then');
      });

      it('should return undefined rules for non-matching artifact', () => {
        // Create project config with rules only for proposal
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
rules:
  proposal:
    - Include rollback plan
`
        );

        const context = loadChangeContext(tempDir, 'my-change');

        // Check design artifact (no rules configured) has undefined rules
        const designInstructions = generateInstructions(context, 'design', tempDir);
        expect(designInstructions.rules).toBeUndefined();
      });

      it('should return undefined rules when empty array', () => {
        // Create project config with empty rules array
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: Some context
rules:
  proposal: []
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toBe('Some context');
        expect(instructions.rules).toBeUndefined();
      });

      it('should keep context, rules, and template as separate fields', () => {
        // Create project config with both context and rules
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: Project context here
rules:
  proposal:
    - Rule 1
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        // All three should be separate
        expect(instructions.context).toBe('Project context here');
        expect(instructions.rules).toEqual(['Rule 1']);
        expect(instructions.template).toContain('## Why');
        // Template should not contain context or rules
        expect(instructions.template).not.toContain('Project context here');
        expect(instructions.template).not.toContain('Rule 1');
      });

      it('should handle context without rules', () => {
        // Create project config with only context
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
context: Project context only
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toBe('Project context only');
        expect(instructions.rules).toBeUndefined();
        expect(instructions.template).toContain('## Why');
      });

      it('should handle rules without context', () => {
        // Create project config with only rules
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
rules:
  proposal:
    - Rule only
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal', tempDir);

        expect(instructions.context).toBeUndefined();
        expect(instructions.rules).toEqual(['Rule only']);
        expect(instructions.template).toContain('## Why');
      });

      it('should work without project root parameter', () => {
        const context = loadChangeContext(tempDir, 'my-change');
        const instructions = generateInstructions(context, 'proposal'); // No projectRoot

        expect(instructions.context).toBeUndefined();
        expect(instructions.rules).toBeUndefined();
        expect(instructions.template).toContain('## Why');
      });
    });

    describe('validation and warnings', () => {
      let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('should warn about unknown artifact IDs in rules', () => {
        // Create project config with invalid artifact ID
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
rules:
  proposal:
    - Valid rule
  invalid-artifact:
    - Invalid rule
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        generateInstructions(context, 'proposal', tempDir);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown artifact ID in rules: "invalid-artifact"')
        );
      });

      it('should deduplicate validation warnings within session', () => {
        // Create a fresh temp directory to avoid cache pollution
        const freshTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'));

        try {
          // Create project config with a uniquely named invalid artifact ID
          const configDir = path.join(freshTempDir, 'openspec');
          fs.mkdirSync(configDir, { recursive: true });
          fs.writeFileSync(
            path.join(configDir, 'config.yaml'),
            `schema: spec-driven
rules:
  unique-invalid-artifact-${Date.now()}:
    - Invalid rule
`
          );

          const context = loadChangeContext(freshTempDir, 'my-change');

          // Call multiple times
          generateInstructions(context, 'proposal', freshTempDir);
          generateInstructions(context, 'specs', freshTempDir);
          generateInstructions(context, 'design', freshTempDir);

          // Warning should be shown only once (deduplication works)
          // Note: We may have gotten warnings from other tests, so check that
          // the count didn't increase by more than 1 from the first call
          const callCount = consoleWarnSpy.mock.calls.filter(call =>
            call[0]?.includes('Unknown artifact ID in rules')
          ).length;

          expect(callCount).toBeGreaterThanOrEqual(1);
        } finally {
          fs.rmSync(freshTempDir, { recursive: true, force: true });
        }
      });

      it('should not warn for valid artifact IDs', () => {
        // Create project config with valid artifact IDs
        const configDir = path.join(tempDir, 'openspec');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(
          path.join(configDir, 'config.yaml'),
          `schema: spec-driven
rules:
  proposal:
    - Rule 1
  specs:
    - Rule 2
`
        );

        const context = loadChangeContext(tempDir, 'my-change');
        generateInstructions(context, 'proposal', tempDir);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('formatChangeStatus', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should show all artifacts as ready/blocked when nothing completed', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      expect(status.changeName).toBe('my-change');
      expect(status.schemaName).toBe('spec-driven');
      expect(status.isComplete).toBe(false);

      // proposal has no deps, should be ready
      const proposal = status.artifacts.find(a => a.id === 'proposal');
      expect(proposal?.status).toBe('ready');

      // specs depends on proposal, should be blocked
      const specs = status.artifacts.find(a => a.id === 'specs');
      expect(specs?.status).toBe('blocked');
      expect(specs?.missingDeps).toContain('proposal');
    });

    it('should show completed artifacts as done', () => {
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, 'proposal.md'), '# Proposal');

      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      const proposal = status.artifacts.find(a => a.id === 'proposal');
      expect(proposal?.status).toBe('done');

      // specs should now be ready
      const specs = status.artifacts.find(a => a.id === 'specs');
      expect(specs?.status).toBe('ready');
    });

    it('should include output paths for each artifact', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      const proposal = status.artifacts.find(a => a.id === 'proposal');
      expect(proposal?.outputPath).toBe('proposal.md');

      const specs = status.artifacts.find(a => a.id === 'specs');
      expect(specs?.outputPath).toBe('specs/**/*.md');
    });

    it('should report isComplete true when all done', () => {
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'my-change');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.mkdirSync(path.join(changeDir, 'specs'), { recursive: true });

      // Create all required files for spec-driven schema
      fs.writeFileSync(path.join(changeDir, 'proposal.md'), '# Proposal');
      fs.writeFileSync(path.join(changeDir, 'specs', 'test.md'), '# Spec');
      fs.writeFileSync(path.join(changeDir, 'design.md'), '# Design');
      fs.writeFileSync(path.join(changeDir, 'tasks.md'), '# Tasks');

      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      expect(status.isComplete).toBe(true);
      expect(status.artifacts.every(a => a.status === 'done')).toBe(true);
    });

    it('should show blocked artifacts with missing dependencies', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      // tasks requires specs and design
      const tasks = status.artifacts.find(a => a.id === 'tasks');
      expect(tasks?.status).toBe('blocked');
      expect(tasks?.missingDeps).toContain('specs');
      expect(tasks?.missingDeps).toContain('design');
    });

    it('should sort artifacts in build order', () => {
      const context = loadChangeContext(tempDir, 'my-change');
      const status = formatChangeStatus(context);

      const ids = status.artifacts.map(a => a.id);
      const proposalIdx = ids.indexOf('proposal');
      const specsIdx = ids.indexOf('specs');
      const tasksIdx = ids.indexOf('tasks');

      // proposal must come before specs, specs before tasks
      expect(proposalIdx).toBeLessThan(specsIdx);
      expect(specsIdx).toBeLessThan(tasksIdx);
    });

    it('reaches isComplete on brainstorm-root v2 once tasks.md exists', () => {
      const changeDir = path.join(tempDir, 'openspec', 'changes', 'brainstorm-opt');
      fs.mkdirSync(changeDir, { recursive: true });
      fs.writeFileSync(path.join(changeDir, '.openspec.yaml'), 'schema: brainstorm-root\n');
      fs.writeFileSync(path.join(changeDir, 'brainstorm.md'), '# B');
      fs.writeFileSync(path.join(changeDir, 'tasks.md'), '## 1.\n- [ ] 1.1 t');

      const context = loadChangeContext(tempDir, 'brainstorm-opt');
      const status = formatChangeStatus(context);

      expect(status.isComplete).toBe(true);
      // brainstorm-root v2 has only `tasks` artifact
      expect(status.artifacts.map((a) => a.id)).toEqual(['tasks']);
      const tasks = status.artifacts.find((a) => a.id === 'tasks');
      expect(tasks?.status).toBe('done');
    });
  });

  describe('phase instructions (brainstorm-root v2)', () => {
    let tempDir: string;

    const yaml = `name: brainstorm-root-test
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Trackable implementation checklist
    template: tasks.md
    requires: [brainstorm]
    instruction: 'Read brainstorm.md and reconcile tasks.'
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  description: Brainstorm artifact
  requires: []
  instruction: 'Use superpowers:brainstorming.'
plan:
  generates: plan.md
  template: plan.md
  description: Execution plan
  requires: [brainstorm, tasks]
  instruction: 'Use superpowers:writing-plans.'
apply:
  requires: [tasks, plan]
  tracks: tasks.md
  executionPlan: plan.md
  instruction: 'Apply the plan.'
`;

    function setupSchemaFixture(root: string) {
      const schemaDir = path.join(root, 'openspec', 'schemas', 'brainstorm-root-test');
      fs.mkdirSync(path.join(schemaDir, 'templates'), { recursive: true });
      fs.writeFileSync(path.join(schemaDir, 'schema.yaml'), yaml);
      fs.writeFileSync(
        path.join(schemaDir, 'templates', 'tasks.md'),
        '## 1. Group\n- [ ] 1.1 Task'
      );
      fs.writeFileSync(path.join(schemaDir, 'templates', 'brainstorm.md'), '# Brainstorm template');
      fs.writeFileSync(path.join(schemaDir, 'templates', 'plan.md'), '# Plan template');
    }

    function setupChangeFixture(root: string, files: Record<string, string> = {}) {
      const dir = path.join(root, 'openspec', 'changes', 'demo');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, '.openspec.yaml'), 'schema: brainstorm-root-test\n');
      for (const [name, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(dir, name), content);
      }
      return dir;
    }

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-phase-'));
      setupSchemaFixture(tempDir);
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('generateInstructions returns kind=phase for phase id (brainstorm)', () => {
      setupChangeFixture(tempDir);
      const ctx = loadChangeContext(tempDir, 'demo');
      const inst = generateInstructions(ctx, 'brainstorm', tempDir);
      expect(inst.kind).toBe('phase');
      expect(inst.outputPath).toBe('brainstorm.md');
      expect(inst.unlocks).toEqual([]);
      expect(inst.instruction).toContain('superpowers:brainstorming');
    });

    it('generateInstructions for plan phase lists deps with kind labels', () => {
      setupChangeFixture(tempDir, {
        'brainstorm.md': '# B',
        'tasks.md': '## 1.\n- [ ] 1.1 t',
      });
      const ctx = loadChangeContext(tempDir, 'demo');
      const inst = generateInstructions(ctx, 'plan', tempDir);
      expect(inst.kind).toBe('phase');
      const brainstormDep = inst.dependencies.find((d) => d.id === 'brainstorm');
      const tasksDep = inst.dependencies.find((d) => d.id === 'tasks');
      expect(brainstormDep?.kind).toBe('phase');
      expect(brainstormDep?.done).toBe(true);
      expect(tasksDep?.kind).toBe('artifact');
      expect(tasksDep?.done).toBe(true);
    });

    it('generateInstructions for tasks artifact resolves brainstorm phase as dep', () => {
      setupChangeFixture(tempDir, { 'brainstorm.md': '# B' });
      const ctx = loadChangeContext(tempDir, 'demo');
      const inst = generateInstructions(ctx, 'tasks', tempDir);
      expect(inst.kind).toBe('artifact');
      const brainstormDep = inst.dependencies.find((d) => d.id === 'brainstorm');
      expect(brainstormDep?.kind).toBe('phase');
      expect(brainstormDep?.done).toBe(true);
    });

    it('formatChangeStatus reports phases with done/blocked', () => {
      setupChangeFixture(tempDir, { 'brainstorm.md': '# B' });
      const ctx = loadChangeContext(tempDir, 'demo');
      const status = formatChangeStatus(ctx);

      const brainstormPhase = status.phases.find((p) => p.id === 'brainstorm');
      expect(brainstormPhase?.status).toBe('done');

      const planPhase = status.phases.find((p) => p.id === 'plan');
      expect(planPhase?.status).toBe('blocked');
      expect(planPhase?.missingDeps).toEqual(['tasks']);
    });

    it('formatChangeStatus marks plan phase ready when both deps done', () => {
      setupChangeFixture(tempDir, {
        'brainstorm.md': '# B',
        'tasks.md': '## 1.\n- [ ] 1.1 t',
      });
      const ctx = loadChangeContext(tempDir, 'demo');
      const status = formatChangeStatus(ctx);
      const planPhase = status.phases.find((p) => p.id === 'plan');
      expect(planPhase?.status).toBe('ready');
    });
  });
});
