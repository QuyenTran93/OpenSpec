import path from 'node:path';
import { promises as fs } from 'node:fs';
import * as fsSync from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { serializeConfig } from './config-prompts.js';

export const BRAINSTORM_PROJECT_SCHEMA = 'brainstorm-root';
export const SPEC_DRIVEN_WORKFLOW_SCHEMA = 'spec-driven';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function fileExistsSync(filePath: string): boolean {
  try {
    fsSync.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveTargetWorkflowSchema(currentSchema: unknown, effectiveWorkflows: readonly string[]): string | undefined {
  const wantBrainstorm = effectiveWorkflows.includes('brainstorm');
  if (wantBrainstorm) {
    return BRAINSTORM_PROJECT_SCHEMA;
  }
  if (currentSchema === BRAINSTORM_PROJECT_SCHEMA) {
    return SPEC_DRIVEN_WORKFLOW_SCHEMA;
  }
  return undefined;
}

export function resolveInitialSchemaForWorkflows(effectiveWorkflows: readonly string[]): string {
  return effectiveWorkflows.includes('brainstorm')
    ? BRAINSTORM_PROJECT_SCHEMA
    : SPEC_DRIVEN_WORKFLOW_SCHEMA;
}

export async function ensureProjectConfigExistsForWorkflows(
  projectPath: string,
  effectiveWorkflows: readonly string[]
): Promise<void> {
  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  if ((await fileExists(configYamlPath)) || (await fileExists(configYmlPath))) {
    return;
  }

  await fs.mkdir(openspecDir, { recursive: true });
  const schema = resolveInitialSchemaForWorkflows(effectiveWorkflows);
  try {
    await fs.writeFile(configYamlPath, serializeConfig({ schema }), { encoding: 'utf-8', flag: 'wx' });
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === 'EEXIST') {
      return;
    }
    throw error;
  }
}

export function ensureProjectConfigExistsForWorkflowsSync(
  projectPath: string,
  effectiveWorkflows: readonly string[]
): void {
  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  if (fileExistsSync(configYamlPath) || fileExistsSync(configYmlPath)) {
    return;
  }

  fsSync.mkdirSync(openspecDir, { recursive: true });
  const schema = resolveInitialSchemaForWorkflows(effectiveWorkflows);
  try {
    fsSync.writeFileSync(configYamlPath, serializeConfig({ schema }), { encoding: 'utf-8', flag: 'wx' });
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === 'EEXIST') {
      return;
    }
    throw error;
  }
}

export async function ensureProjectSchemaForWorkflows(projectPath: string, effectiveWorkflows: readonly string[]): Promise<void> {
  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  await fs.mkdir(openspecDir, { recursive: true });

  const existingPath = await fileExists(configYamlPath)
    ? configYamlPath
    : (await fileExists(configYmlPath) ? configYmlPath : configYamlPath);

  if (!(await fileExists(existingPath))) {
    if (!effectiveWorkflows.includes('brainstorm')) {
      return;
    }
    await fs.writeFile(configYamlPath, serializeConfig({ schema: BRAINSTORM_PROJECT_SCHEMA }), 'utf-8');
    return;
  }

  const raw = await fs.readFile(existingPath, 'utf-8');
  const parsed = parseYaml(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML object in ${existingPath}`);
  }

  const record = parsed as Record<string, unknown>;
  const targetSchema = resolveTargetWorkflowSchema(record.schema, effectiveWorkflows);

  if (targetSchema === undefined) {
    return;
  }

  const next = { ...record, schema: targetSchema };
  await fs.writeFile(existingPath, stringifyYaml(next), 'utf-8');
}

export function ensureProjectSchemaForWorkflowsSync(projectPath: string, effectiveWorkflows: readonly string[]): void {
  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  fsSync.mkdirSync(openspecDir, { recursive: true });

  const existingPath = fileExistsSync(configYamlPath)
    ? configYamlPath
    : (fileExistsSync(configYmlPath) ? configYmlPath : configYamlPath);

  if (!fileExistsSync(existingPath)) {
    if (!effectiveWorkflows.includes('brainstorm')) {
      return;
    }
    fsSync.writeFileSync(configYamlPath, serializeConfig({ schema: BRAINSTORM_PROJECT_SCHEMA }), 'utf-8');
    return;
  }

  const raw = fsSync.readFileSync(existingPath, 'utf-8');
  const parsed = parseYaml(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML object in ${existingPath}`);
  }

  const record = parsed as Record<string, unknown>;
  const targetSchema = resolveTargetWorkflowSchema(record.schema, effectiveWorkflows);

  if (targetSchema === undefined) {
    return;
  }

  const next = { ...record, schema: targetSchema };
  fsSync.writeFileSync(existingPath, stringifyYaml(next), 'utf-8');
}
