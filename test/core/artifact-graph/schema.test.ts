import { describe, it, expect } from 'vitest';
import { parseSchema, SchemaValidationError } from '../../../src/core/artifact-graph/schema.js';

describe('artifact-graph/schema', () => {
  describe('parseSchema', () => {
    it('should parse valid schema YAML', () => {
      const yaml = `
name: test-schema
version: 1
description: A test schema
artifacts:
  - id: proposal
    generates: proposal.md
    description: Initial proposal
    template: templates/proposal.md
    requires: []
  - id: design
    generates: design.md
    description: Design document
    template: templates/design.md
    requires:
      - proposal
`;
      const schema = parseSchema(yaml);

      expect(schema.name).toBe('test-schema');
      expect(schema.version).toBe(1);
      expect(schema.description).toBe('A test schema');
      expect(schema.artifacts).toHaveLength(2);
      expect(schema.artifacts[0].id).toBe('proposal');
      expect(schema.artifacts[1].requires).toEqual(['proposal']);
    });

    it('should throw on missing required fields', () => {
      const yaml = `
name: test-schema
version: 1
artifacts:
  - id: proposal
    description: Missing generates and template
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/generates/);
    });

    it('should throw on missing schema name', () => {
      const yaml = `
version: 1
artifacts:
  - id: proposal
    generates: proposal.md
    description: Test
    template: templates/proposal.md
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/name/);
    });

    it('should throw on invalid version (non-positive)', () => {
      const yaml = `
name: test
version: 0
artifacts:
  - id: proposal
    generates: proposal.md
    description: Test
    template: templates/proposal.md
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/positive/);
    });

    it('should throw on empty artifacts array', () => {
      const yaml = `
name: test
version: 1
artifacts: []
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/artifact/i);
    });

    it('should throw on duplicate artifact IDs', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: proposal
    generates: proposal.md
    description: First
    template: templates/proposal.md
  - id: proposal
    generates: other.md
    description: Duplicate
    template: templates/other.md
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Duplicate artifact ID: proposal/);
    });

    it('should throw on invalid requires reference', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: design
    generates: design.md
    description: Design doc
    template: templates/design.md
    requires:
      - nonexistent
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Invalid dependency reference.*nonexistent/);
    });

    it('should throw on invalid apply.requires reference', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: brainstorm
    generates: brainstorm.md
    description: Brainstorm
    template: templates/brainstorm.md
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: templates/tasks.md
apply:
  requires:
    - nonexistent
  tracks: tasks.md
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Invalid apply\.requires reference.*nonexistent/);
    });

    it('should detect self-referencing cycle', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: A
    generates: a.md
    description: Self reference
    template: templates/a.md
    requires:
      - A
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Cyclic dependency detected/);
    });

    it('should detect simple A → B → A cycle', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: A
    generates: a.md
    description: A
    template: templates/a.md
    requires:
      - B
  - id: B
    generates: b.md
    description: B
    template: templates/b.md
    requires:
      - A
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Cyclic dependency detected/);
      expect(() => parseSchema(yaml)).toThrow(/→/);
    });

    it('should detect longer A → B → C → A cycle and list all IDs', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: A
    generates: a.md
    description: A
    template: templates/a.md
    requires:
      - C
  - id: B
    generates: b.md
    description: B
    template: templates/b.md
    requires:
      - A
  - id: C
    generates: c.md
    description: C
    template: templates/c.md
    requires:
      - B
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/Cyclic dependency detected/);
      // Should contain all three in the cycle path
      const error = (() => {
        try {
          parseSchema(yaml);
        } catch (e) {
          return e;
        }
      })() as Error;
      expect(error.message).toMatch(/A.*→.*B|B.*→.*C|C.*→.*A/);
    });

    it('should allow default empty requires array', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: root
    generates: root.md
    description: Root artifact
    template: templates/root.md
`;
      const schema = parseSchema(yaml);
      expect(schema.artifacts[0].requires).toEqual([]);
    });

    it('should parse optional artifacts', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: root
    generates: root.md
    description: Root
    template: templates/root.md
    requires: []
  - id: opt
    generates: opt.md
    description: Optional
    template: templates/opt.md
    optional: true
    requires:
      - root
`;
      const schema = parseSchema(yaml);
      expect(schema.artifacts.find(a => a.id === 'opt')?.optional).toBe(true);
      expect(schema.artifacts.find(a => a.id === 'root')?.optional).toBeUndefined();
    });

    it('should reject optional artifact as dependency of another artifact', () => {
      const yaml = `
name: test
version: 1
artifacts:
  - id: root
    generates: root.md
    description: Root
    template: templates/root.md
    requires: []
  - id: opt
    generates: opt.md
    description: Optional
    template: templates/opt.md
    optional: true
    requires:
      - root
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: templates/tasks.md
    requires:
      - opt
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/optional outputs must not gate/);
    });
  });

  describe('phases (brainstorm-root v2)', () => {
    it('parses optional brainstorm + plan top-level phases', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [brainstorm]
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  requires: []
plan:
  generates: plan.md
  template: plan.md
  requires: [brainstorm, tasks]
apply:
  requires: [tasks, plan]
  tracks: tasks.md
  executionPlan: plan.md
`;
      const schema = parseSchema(yaml);
      expect(schema.brainstorm?.generates).toBe('brainstorm.md');
      expect(schema.plan?.generates).toBe('plan.md');
      expect(schema.plan?.requires).toEqual(['brainstorm', 'tasks']);
      expect(schema.apply?.requires).toEqual(['tasks', 'plan']);
    });

    it('accepts artifact requires referencing a phase id', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [brainstorm]
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  requires: []
`;
      expect(() => parseSchema(yaml)).not.toThrow();
    });

    it('rejects requires referencing an unknown id (artifact or phase)', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [missing]
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/missing/);
    });

    it('detects cycles across artifact and phase nodes', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [brainstorm]
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  requires: [tasks]
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/[Cc]yclic/);
    });

    it('allows apply.requires to reference both artifact and phase ids', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: [brainstorm]
brainstorm:
  generates: brainstorm.md
  template: brainstorm.md
  requires: []
plan:
  generates: plan.md
  template: plan.md
  requires: [tasks]
apply:
  requires: [tasks, plan]
  tracks: tasks.md
  executionPlan: plan.md
`;
      expect(() => parseSchema(yaml)).not.toThrow();
    });

    it('rejects apply.requires referencing unknown id', () => {
      const yaml = `
name: ts
version: 2
artifacts:
  - id: tasks
    generates: tasks.md
    description: Tasks
    template: tasks.md
    requires: []
apply:
  requires: [tasks, ghost]
  tracks: tasks.md
`;
      expect(() => parseSchema(yaml)).toThrow(SchemaValidationError);
      expect(() => parseSchema(yaml)).toThrow(/ghost/);
    });
  });
});
