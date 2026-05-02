import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import {
  BRAINSTORM_PROJECT_SCHEMA,
  SPEC_DRIVEN_WORKFLOW_SCHEMA,
  ensureProjectSchemaForWorkflows,
} from '../../src/core/project-config-normalizer.js';
import { BRAINSTORM_WORKFLOWS } from '../../src/core/profiles.js';

describe('project-config-normalizer', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = path.join(os.tmpdir(), `openspec-normalizer-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(projectDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it('writes openspec/config.yaml with brainstorm-root when file is missing and workflows include brainstorm', async () => {
    await ensureProjectSchemaForWorkflows(projectDir, [...BRAINSTORM_WORKFLOWS]);
    const content = await fs.readFile(path.join(projectDir, 'openspec', 'config.yaml'), 'utf-8');
    expect(content).toContain(`schema: ${BRAINSTORM_PROJECT_SCHEMA}`);
  });

  it('rewrites schema to brainstorm-root when workflows include brainstorm', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, `schema: ${SPEC_DRIVEN_WORKFLOW_SCHEMA}\n`, 'utf-8');
    await ensureProjectSchemaForWorkflows(projectDir, ['brainstorm']);
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain(`schema: ${BRAINSTORM_PROJECT_SCHEMA}`);
  });

  it('does not create config when brainstorm is absent and file is missing', async () => {
    await ensureProjectSchemaForWorkflows(projectDir, ['propose', 'apply']);
    await expect(fs.access(path.join(projectDir, 'openspec', 'config.yaml'))).rejects.toThrow();
  });

  it('downgrades brainstorm-root to spec-driven when workflows no longer include brainstorm', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, `schema: ${BRAINSTORM_PROJECT_SCHEMA}\n`, 'utf-8');
    await ensureProjectSchemaForWorkflows(projectDir, ['propose', 'apply']);
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain(`schema: ${SPEC_DRIVEN_WORKFLOW_SCHEMA}`);
  });

  it('does not overwrite schema spec-driven when workflows lack brainstorm', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, `schema: ${SPEC_DRIVEN_WORKFLOW_SCHEMA}\n`, 'utf-8');
    await ensureProjectSchemaForWorkflows(projectDir, ['propose', 'apply']);
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toContain(`schema: ${SPEC_DRIVEN_WORKFLOW_SCHEMA}`);
  });
});
