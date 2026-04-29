import path from 'node:path';
import { promises as fs } from 'node:fs';
import * as fsSync from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { Profile } from './global-config.js';
import { serializeConfig } from './config-prompts.js';

const BRAINSTORM_SCHEMA = 'brainstorm-root';

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

export async function ensureProjectSchemaForProfile(projectPath: string, profile: Profile): Promise<void> {
  if (profile !== 'brainstorm') {
    return;
  }

  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  await fs.mkdir(openspecDir, { recursive: true });

  const existingPath = await fileExists(configYamlPath)
    ? configYamlPath
    : (await fileExists(configYmlPath) ? configYmlPath : configYamlPath);

  if (!(await fileExists(existingPath))) {
    await fs.writeFile(configYamlPath, serializeConfig({ schema: BRAINSTORM_SCHEMA }), 'utf-8');
    return;
  }

  const raw = await fs.readFile(existingPath, 'utf-8');
  const parsed = parseYaml(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML object in ${existingPath}`);
  }

  const next = { ...(parsed as Record<string, unknown>), schema: BRAINSTORM_SCHEMA };
  await fs.writeFile(existingPath, stringifyYaml(next), 'utf-8');
}

export function ensureProjectSchemaForProfileSync(projectPath: string, profile: Profile): void {
  if (profile !== 'brainstorm') {
    return;
  }

  const openspecDir = path.join(projectPath, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const configYmlPath = path.join(openspecDir, 'config.yml');

  fsSync.mkdirSync(openspecDir, { recursive: true });

  const existingPath = fileExistsSync(configYamlPath)
    ? configYamlPath
    : (fileExistsSync(configYmlPath) ? configYmlPath : configYamlPath);

  if (!fileExistsSync(existingPath)) {
    fsSync.writeFileSync(configYamlPath, serializeConfig({ schema: BRAINSTORM_SCHEMA }), 'utf-8');
    return;
  }

  const raw = fsSync.readFileSync(existingPath, 'utf-8');
  const parsed = parseYaml(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML object in ${existingPath}`);
  }
  const next = { ...(parsed as Record<string, unknown>), schema: BRAINSTORM_SCHEMA };
  fsSync.writeFileSync(existingPath, stringifyYaml(next), 'utf-8');
}
