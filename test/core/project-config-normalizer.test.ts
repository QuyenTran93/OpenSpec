import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { ensureProjectSchemaForProfile } from '../../src/core/project-config-normalizer.js';

describe('project-config-normalizer', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = path.join(os.tmpdir(), `openspec-normalizer-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(projectDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it('writes openspec/config.yaml with brainstorm-root when file is missing', async () => {
    await ensureProjectSchemaForProfile(projectDir, 'brainstorm');
    const content = await fs.readFile(path.join(projectDir, 'openspec', 'config.yaml'), 'utf-8');
    expect(content).toContain('schema: brainstorm-root');
  });

  it('rewrites existing schema when profile is brainstorm', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, 'schema: spec-driven\n', 'utf-8');
    await ensureProjectSchemaForProfile(projectDir, 'brainstorm');
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain('schema: brainstorm-root');
  });

  it('does not rewrite schema when profile is core', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, 'schema: spec-driven\n', 'utf-8');
    await ensureProjectSchemaForProfile(projectDir, 'core');
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain('schema: spec-driven');
  });
});
