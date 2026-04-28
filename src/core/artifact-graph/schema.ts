import * as fs from 'node:fs';
import { parse as parseYaml } from 'yaml';
import {
  SchemaYamlSchema,
  type SchemaYaml,
  type Phase,
  PHASE_IDS,
} from './types.js';

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Loads and validates an artifact schema from a YAML file.
 */
export function loadSchema(filePath: string): SchemaYaml {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSchema(content);
}

/**
 * Parses and validates an artifact schema from YAML content.
 */
export function parseSchema(yamlContent: string): SchemaYaml {
  const parsed = parseYaml(yamlContent);

  const result = SchemaYamlSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new SchemaValidationError(`Invalid schema: ${errors}`);
  }

  const schema = result.data;

  validateNoDuplicateIds(schema);
  validateRequiresReferences(schema);
  validateOptionalArtifactsNotRequiredByOthers(schema);
  validateApplyRequiresReferences(schema);
  validateNoCycles(schema);

  return schema;
}

/** All node IDs in the schema: artifact IDs ∪ defined phase IDs. */
function collectNodeIds(schema: SchemaYaml): Set<string> {
  const ids = new Set<string>(schema.artifacts.map((a) => a.id));
  for (const pid of PHASE_IDS) {
    if (pid === 'apply') {
      if (schema.apply) ids.add('apply');
    } else if (schema[pid]) {
      ids.add(pid);
    }
  }
  return ids;
}

/**
 * Validates that there are no duplicate IDs across artifacts and phases.
 */
function validateNoDuplicateIds(schema: SchemaYaml): void {
  const seen = new Set<string>();
  for (const artifact of schema.artifacts) {
    if (seen.has(artifact.id)) {
      throw new SchemaValidationError(`Duplicate artifact ID: ${artifact.id}`);
    }
    seen.add(artifact.id);
  }
  for (const pid of PHASE_IDS) {
    const exists = pid === 'apply' ? Boolean(schema.apply) : Boolean(schema[pid]);
    if (exists && seen.has(pid)) {
      throw new SchemaValidationError(
        `Phase ID '${pid}' collides with an artifact of the same name`
      );
    }
  }
}

/**
 * Validates that all `requires` references point to valid artifact or phase IDs.
 */
function validateRequiresReferences(schema: SchemaYaml): void {
  const validIds = collectNodeIds(schema);

  for (const artifact of schema.artifacts) {
    for (const req of artifact.requires) {
      if (!validIds.has(req)) {
        throw new SchemaValidationError(
          `Invalid dependency reference in artifact '${artifact.id}': '${req}' does not exist`
        );
      }
    }
  }

  for (const pid of PHASE_IDS) {
    if (pid === 'apply') continue;
    const phase = schema[pid] as Phase | undefined;
    if (!phase) continue;
    for (const req of phase.requires) {
      if (!validIds.has(req)) {
        throw new SchemaValidationError(
          `Invalid dependency reference in phase '${pid}': '${req}' does not exist`
        );
      }
    }
  }
}

/**
 * Optional artifacts may be skipped; they must not be hard dependencies of other artifacts.
 */
function validateOptionalArtifactsNotRequiredByOthers(schema: SchemaYaml): void {
  const optionalIds = new Set(
    schema.artifacts.filter((a) => a.optional === true).map((a) => a.id)
  );
  if (optionalIds.size === 0) {
    return;
  }

  for (const artifact of schema.artifacts) {
    for (const req of artifact.requires) {
      if (optionalIds.has(req)) {
        throw new SchemaValidationError(
          `Optional artifact '${req}' cannot appear in requires of '${artifact.id}' (optional outputs must not gate other artifacts)`
        );
      }
    }
  }
}

/**
 * Validates that apply.requires references point to valid artifact or phase IDs.
 */
function validateApplyRequiresReferences(schema: SchemaYaml): void {
  if (!schema.apply) return;

  const validIds = collectNodeIds(schema);
  for (const req of schema.apply.requires) {
    if (!validIds.has(req)) {
      throw new SchemaValidationError(
        `Invalid apply.requires reference: '${req}' does not exist in artifacts or phases`
      );
    }
  }
}

/**
 * Validates that there are no cyclic dependencies across artifacts and phases.
 * Uses DFS to detect cycles and reports the full cycle path.
 */
function validateNoCycles(schema: SchemaYaml): void {
  type Node = { id: string; requires: string[] };
  const nodes: Node[] = [];

  for (const a of schema.artifacts) {
    nodes.push({ id: a.id, requires: a.requires });
  }
  for (const pid of PHASE_IDS) {
    if (pid === 'apply') {
      if (schema.apply) nodes.push({ id: 'apply', requires: schema.apply.requires });
    } else {
      const phase = schema[pid] as Phase | undefined;
      if (phase) nodes.push({ id: pid, requires: phase.requires });
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const parent = new Map<string, string>();

  function dfs(id: string): string | null {
    visited.add(id);
    inStack.add(id);

    const node = nodeMap.get(id);
    if (!node) return null;

    for (const dep of node.requires) {
      if (!visited.has(dep)) {
        parent.set(dep, id);
        const cycle = dfs(dep);
        if (cycle) return cycle;
      } else if (inStack.has(dep)) {
        const cyclePath = [dep];
        let current = id;
        while (current !== dep) {
          cyclePath.unshift(current);
          current = parent.get(current)!;
        }
        cyclePath.unshift(dep);
        return cyclePath.join(' → ');
      }
    }

    inStack.delete(id);
    return null;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cycle = dfs(node.id);
      if (cycle) {
        throw new SchemaValidationError(`Cyclic dependency detected: ${cycle}`);
      }
    }
  }
}
