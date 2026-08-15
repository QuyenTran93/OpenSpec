import { describe, it, expect } from 'vitest';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
} from '../../../src/core/shared/skill-generation.js';
import { BRAINSTORM_WORKFLOWS } from '../../../src/core/profiles.js';

describe('skill-generation', () => {
  it('generates one unique entry per brainstorm workflow', () => {
    const skills = getSkillTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm');
    const commands = getCommandTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm');

    expect(new Set(skills.map((entry) => entry.workflowId))).toEqual(new Set(BRAINSTORM_WORKFLOWS));
    expect(new Set(skills.map((entry) => entry.dirName)).size).toBe(skills.length);
    expect(new Set(commands.map((entry) => entry.id))).toEqual(new Set(BRAINSTORM_WORKFLOWS));
    expect(commands.length).toBe(BRAINSTORM_WORKFLOWS.length);
  });

  it('keeps generated brainstorm workflows self-contained', () => {
    const runtime = [
      ...getSkillTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm').map((entry) => entry.template.instructions),
      ...getCommandTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm').map((entry) => entry.template.content),
    ].join('\n');

    expect(runtime).not.toMatch(/superpowers:/i);
    expect(runtime).not.toMatch(/plugin (?:install|required|missing)/i);
    expect(runtime).toContain('Ask one clarifying question at a time');
    expect(runtime).toContain('RED → GREEN → REFACTOR');
    expect(runtime).toContain('fresh verification evidence');
    expect(runtime).toContain('--schema brainstorm');
    expect(runtime).not.toContain('brainstorm-root');
    expect(runtime).toContain('inline in the primary session');
    expect(runtime).toContain('review-only subagent');
    expect(runtime).toContain('read-only research');
    expect(runtime).toContain('expanded inline self-review');
    expect(runtime).toContain('isolated worktree');
    expect(runtime).toContain('Before the first edit, confirm the execution surface');
    expect(runtime).toContain('surface the blocker immediately instead of guessing or claiming progress');
    expect(runtime).toContain('dependency order');
    expect(runtime).toContain('requirements compliance before code quality');
    expect(runtime).toContain('<planningHome.root>/TODO.md');
    expect(runtime).toContain('follow-up work');
    expect(runtime).toContain('manual testing, verification, archiving');
    expect(runtime).toContain('routine workflow-completion steps');
    expect(runtime).toContain('VCS decisions');
    expect(runtime).not.toMatch(/subagent-driven (?:development|execution|implementation)/i);
  });

  it('scopes the deferred follow-up policy to workflows that can discover deferred work', () => {
    const included = ['brainstorm', 'propose', 'writing-plans', 'update', 'apply'];
    const excluded = ['new', 'archive'];

    for (const workflowId of included) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'brainstorm')[0].template.content;
      for (const content of [skill, command]) {
        expect(content, workflowId).toContain('Deferred follow-up policy:');
        expect(content, workflowId).toContain('<planningHome.root>/TODO.md');
        expect(content, workflowId).toContain('semantically equivalent');
        expect(content, workflowId).toContain('Do not create or modify');
      }
    }

    for (const workflowId of excluded) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'brainstorm')[0].template.content;
      expect(skill, workflowId).not.toContain('Deferred follow-up policy:');
      expect(command, workflowId).not.toContain('Deferred follow-up policy:');
    }
  });

  it('scopes the artifact prose policy to brainstorm planning artifact writers', () => {
    const included = ['brainstorm', 'propose', 'writing-plans', 'update'];

    for (const workflowId of included) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'brainstorm')[0].template.content;
      expect(skill, workflowId).toContain('Artifact prose policy:');
      expect(command, workflowId).toContain('Artifact prose policy:');
    }

    for (const workflowId of ['new', 'apply', 'archive']) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'brainstorm')[0].template.content;
      expect(skill, workflowId).not.toContain('Artifact prose policy:');
      expect(command, workflowId).not.toContain('Artifact prose policy:');
    }

    for (const workflowId of ['propose', 'update']) {
      const skill = getSkillTemplates([workflowId], 'core')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'core')[0].template.content;
      expect(skill, workflowId).not.toContain('Artifact prose policy:');
      expect(command, workflowId).not.toContain('Artifact prose policy:');
    }
  });

  it.each([
    {
      workflowId: 'brainstorm',
      writeMarker: '4. Write `brainstorm.md`',
      reviewMarker: '5. Self-review the written artifact',
      fixMarker: '6. Fix every finding in `brainstorm.md`',
    },
    {
      workflowId: 'propose',
      writeMarker: '6. **Write `tasks.md`',
      reviewMarker: '7. **Self-review the written `tasks.md`**',
      fixMarker: '8. **Fix every finding in `tasks.md`**',
    },
    {
      workflowId: 'writing-plans',
      writeMarker: '6. Write the plan to the returned resolved output path.',
      reviewMarker: '7. Self-review the written `plan.md`',
      fixMarker: '8. Fix every finding in `plan.md`',
    },
    {
      workflowId: 'update',
      writeMarker: '4. Reconcile and write existing planning artifacts',
      reviewMarker: '5. Self-review the written artifacts',
      fixMarker: '6. Fix every finding in the artifacts',
    },
  ])('runs $workflowId prose policy after writing, self-review, and fixes', ({ workflowId, writeMarker, reviewMarker, fixMarker }) => {
    const generated = [
      getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions,
      getCommandTemplates([workflowId], 'brainstorm')[0].template.content,
    ];

    for (const content of generated) {
      const write = content.indexOf(writeMarker);
      const review = content.indexOf(reviewMarker);
      const fix = content.indexOf(fixMarker);
      const policy = content.indexOf('Artifact prose policy:');
      expect(write).toBeGreaterThan(-1);
      expect(review).toBeGreaterThan(write);
      expect(fix).toBeGreaterThan(review);
      expect(policy).toBeGreaterThan(fix);
    }
  });

  it('makes writing-plans resolve and reuse the local test organization', () => {
    const skill = getSkillTemplates(['writing-plans'], 'brainstorm')[0].template.instructions;
    const command = getCommandTemplates(['writing-plans'], 'brainstorm')[0].template.content;

    for (const content of [skill, command]) {
      expect(content).toContain('existing local test convention is authoritative');
      expect(content).toContain('`tests/`, `test/`, or `__tests__/`');
      expect(content).toContain('nearest package or module scope');
      expect(content).toContain('deliberate colocated-test convention');
      expect(content).toContain('second test-root convention');
      expect(content).toContain('Do not migrate existing tests');
      expect(content).toContain('Do not create an empty test directory');
      expect(content).toContain('setup prerequisites');
      expect(content).toContain('project-level verification command');
      expect(content).toContain('baseline or reproduction command');
      expect(content).not.toContain('test-path organization');
      expect(content).toContain('Replace every semantic template placeholder');
      expect(content).toContain('exact project-specific path, code-fence language, command, and expected result');
      expect(content).toContain('Raw semantic placeholders must not remain in plan.md');
    }
  });

  it('persists each verified task checkbox before advancing or resuming', () => {
    for (const workflowId of ['writing-plans', 'apply']) {
      const skill = getSkillTemplates([workflowId], 'brainstorm')[0].template.instructions;
      const command = getCommandTemplates([workflowId], 'brainstorm')[0].template.content;
      for (const content of [skill, command]) {
        expect(content, workflowId).toContain('acceptance criteria and focused verification pass');
        expect(content, workflowId).toContain('before starting the next task');
        expect(content, workflowId).toContain('Never batch-fill');
        expect(content, workflowId).toContain('failed, partial, or blocked');
        expect(content, workflowId).toContain('If updating tasks.md fails, stop');
        expect(content, workflowId).toContain('On resume, reread tasks.md');
        expect(content, workflowId).toContain('first incomplete task');
        expect(content, workflowId).toContain('Before the first edit, confirm the execution surface');
        expect(content, workflowId).toContain('surface the blocker immediately instead of guessing or claiming progress');
      }
    }
  });
  describe('getSkillTemplates', () => {
    it('should return all 12 skill templates', () => {
      const templates = getSkillTemplates();
      expect(templates).toHaveLength(12);
    });

    it('should have unique directory names', () => {
      const templates = getSkillTemplates();
      const dirNames = templates.map(t => t.dirName);
      const uniqueDirNames = new Set(dirNames);
      expect(uniqueDirNames.size).toBe(templates.length);
    });

    it('should include all expected skills', () => {
      const templates = getSkillTemplates();
      const dirNames = templates.map(t => t.dirName);

      expect(dirNames).toContain('openspec-explore');
      expect(dirNames).toContain('openspec-new-change');
      expect(dirNames).toContain('openspec-continue-change');
      expect(dirNames).toContain('openspec-apply-change');
      expect(dirNames).toContain('openspec-update-change');
      expect(dirNames).toContain('openspec-ff-change');
      expect(dirNames).toContain('openspec-sync-specs');
      expect(dirNames).toContain('openspec-archive-change');
      expect(dirNames).toContain('openspec-bulk-archive-change');
      expect(dirNames).toContain('openspec-verify-change');
      expect(dirNames).toContain('openspec-onboard');
      expect(dirNames).toContain('openspec-propose');
    });

    it('should have valid template structure', () => {
      const templates = getSkillTemplates();

      for (const { template, dirName, workflowId } of templates) {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.instructions).toBeTruthy();
        expect(dirName).toBeTruthy();
        expect(workflowId).toBeTruthy();
      }
    });

    it('should have unique workflow IDs', () => {
      const templates = getSkillTemplates();
      const ids = templates.map(t => t.workflowId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(templates.length);
    });

    it('should filter by workflow IDs when provided', () => {
      const filtered = getSkillTemplates(['propose', 'explore', 'apply', 'archive']);
      expect(filtered).toHaveLength(4);
      const ids = filtered.map(t => t.workflowId);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).toContain('apply');
      expect(ids).toContain('archive');
      expect(ids).not.toContain('new');
      expect(ids).not.toContain('ff');
    });

    it('should return all templates when filter is undefined', () => {
      const all = getSkillTemplates();
      const noFilter = getSkillTemplates(undefined);
      expect(noFilter).toHaveLength(all.length);
    });

    it('should return empty array when filter matches nothing', () => {
      const filtered = getSkillTemplates(['nonexistent']);
      expect(filtered).toHaveLength(0);
    });

    it('should return single template when filter has one workflow', () => {
      const filtered = getSkillTemplates(['propose']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].workflowId).toBe('propose');
      expect(filtered[0].dirName).toBe('openspec-propose');
    });
  });

  describe('getCommandTemplates', () => {
    it('should return all 12 command templates', () => {
      const templates = getCommandTemplates();
      expect(templates).toHaveLength(12);
    });

    it('should have unique IDs', () => {
      const templates = getCommandTemplates();
      const ids = templates.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(templates.length);
    });

    it('should include all expected commands', () => {
      const templates = getCommandTemplates();
      const ids = templates.map(t => t.id);

      expect(ids).toContain('explore');
      expect(ids).toContain('new');
      expect(ids).toContain('continue');
      expect(ids).toContain('apply');
      expect(ids).toContain('update');
      expect(ids).toContain('ff');
      expect(ids).toContain('sync');
      expect(ids).toContain('archive');
      expect(ids).toContain('bulk-archive');
      expect(ids).toContain('verify');
      expect(ids).toContain('onboard');
      expect(ids).toContain('propose');
    });

    it('should filter by workflow IDs when provided', () => {
      const filtered = getCommandTemplates(['propose', 'explore', 'apply', 'archive']);
      expect(filtered).toHaveLength(4);
      const ids = filtered.map(t => t.id);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).toContain('apply');
      expect(ids).toContain('archive');
      expect(ids).not.toContain('new');
      expect(ids).not.toContain('ff');
    });

    it('should return all templates when filter is undefined', () => {
      const all = getCommandTemplates();
      const noFilter = getCommandTemplates(undefined);
      expect(noFilter).toHaveLength(all.length);
    });

    it('should return empty array when filter matches nothing', () => {
      const filtered = getCommandTemplates(['nonexistent']);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getCommandContents', () => {
    it('should return all 12 command contents', () => {
      const contents = getCommandContents();
      expect(contents).toHaveLength(12);
    });

    it('should have valid content structure', () => {
      const contents = getCommandContents();

      for (const content of contents) {
        expect(content.id).toBeTruthy();
        expect(content.name).toBeTruthy();
        expect(content.description).toBeTruthy();
        expect(content.body).toBeTruthy();
      }
    });

    it('should have matching IDs with command templates', () => {
      const templates = getCommandTemplates();
      const contents = getCommandContents();

      const templateIds = templates.map(t => t.id).sort();
      const contentIds = contents.map(c => c.id).sort();

      expect(contentIds).toEqual(templateIds);
    });

    it('should filter by workflow IDs when provided', () => {
      const filtered = getCommandContents(['propose', 'explore']);
      expect(filtered).toHaveLength(2);
      const ids = filtered.map(c => c.id);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).not.toContain('new');
    });

    it('should return all contents when filter is undefined', () => {
      const all = getCommandContents();
      const noFilter = getCommandContents(undefined);
      expect(noFilter).toHaveLength(all.length);
    });
  });

  describe('generateSkillContent', () => {
    it('should generate valid YAML frontmatter', () => {
      const template = {
        name: 'test-skill',
        description: 'Test description',
        instructions: 'Test instructions',
        license: 'MIT',
        compatibility: 'Test compatibility',
        metadata: {
          author: 'test-author',
          version: '2.0',
        },
      };

      const content = generateSkillContent(template, '0.23.0');

      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name: test-skill');
      expect(content).toContain('description: Test description');
      expect(content).toContain('license: MIT');
      expect(content).toContain('compatibility: Test compatibility');
      expect(content).toContain('author: test-author');
      expect(content).toContain('version: "2.0"');
      expect(content).toContain('generatedBy: "0.23.0"');
      expect(content).toContain('Test instructions');
    });

    it('should use default values for optional fields', () => {
      const template = {
        name: 'minimal-skill',
        description: 'Minimal description',
        instructions: 'Minimal instructions',
      };

      const content = generateSkillContent(template, '0.24.0');

      expect(content).toContain('license: MIT');
      expect(content).toContain('compatibility: Requires openspec CLI.');
      expect(content).toContain('author: openspec');
      expect(content).toContain('version: "1.0"');
      expect(content).toContain('generatedBy: "0.24.0"');
    });

    it('should embed the provided version in generatedBy field', () => {
      const template = {
        name: 'version-test',
        description: 'Test version embedding',
        instructions: 'Instructions',
      };

      const content1 = generateSkillContent(template, '0.23.0');
      expect(content1).toContain('generatedBy: "0.23.0"');

      const content2 = generateSkillContent(template, '1.0.0');
      expect(content2).toContain('generatedBy: "1.0.0"');

      const content3 = generateSkillContent(template, '0.24.0-beta.1');
      expect(content3).toContain('generatedBy: "0.24.0-beta.1"');
    });

    it('should end frontmatter with separator and blank line', () => {
      const template = {
        name: 'test',
        description: 'Test',
        instructions: 'Body content',
      };

      const content = generateSkillContent(template, '0.23.0');

      expect(content).toMatch(/---\n\nBody content\n$/);
    });

    it('should apply transformInstructions callback when provided', () => {
      const template = {
        name: 'transform-test',
        description: 'Test transform callback',
        instructions: 'Use /opsx:new to start and /opsx:apply to implement.',
      };

      const transformer = (text: string) => text.replace(/\/opsx:/g, '/opsx-');
      const content = generateSkillContent(template, '0.23.0', transformer);

      expect(content).toContain('/opsx-new');
      expect(content).toContain('/opsx-apply');
      expect(content).not.toContain('/opsx:new');
      expect(content).not.toContain('/opsx:apply');
    });

    it('should not transform instructions when callback is undefined', () => {
      const template = {
        name: 'no-transform-test',
        description: 'Test without transform',
        instructions: 'Use /opsx:new to start.',
      };

      const content = generateSkillContent(template, '0.23.0', undefined);

      expect(content).toContain('/opsx:new');
    });

    it('should support custom transformInstructions logic', () => {
      const template = {
        name: 'custom-transform',
        description: 'Test custom transform',
        instructions: 'Some PLACEHOLDER text here.',
      };

      const customTransformer = (text: string) => text.replace('PLACEHOLDER', 'REPLACED');
      const content = generateSkillContent(template, '0.23.0', customTransformer);

      expect(content).toContain('Some REPLACED text here.');
      expect(content).not.toContain('PLACEHOLDER');
    });
  });
});
