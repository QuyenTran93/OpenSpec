import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import {
  BRAINSTORM_PROJECT_SCHEMA,
  SPEC_DRIVEN_WORKFLOW_SCHEMA,
  ensureProjectConfigExistsForWorkflows,
  ensureProjectConfigExistsForWorkflowsSync,
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

  async function readConfigYaml(projectPath: string): Promise<Record<string, unknown>> {
    const content = await fs.readFile(path.join(projectPath, 'openspec', 'config.yaml'), 'utf-8');
    const parsed = parseYaml(content);
    expect(parsed).toBeTypeOf('object');
    expect(parsed).not.toBeNull();
    return parsed as Record<string, unknown>;
  }

  it('creates config.yaml with brainstorm-root when missing and workflows include brainstorm', async () => {
    await ensureProjectConfigExistsForWorkflows(projectDir, [...BRAINSTORM_WORKFLOWS]);
    const parsed = await readConfigYaml(projectDir);
    expect(parsed.schema).toBe(BRAINSTORM_PROJECT_SCHEMA);
  });

  it('creates config.yaml with spec-driven when missing and workflows do not include brainstorm', async () => {
    await ensureProjectConfigExistsForWorkflows(projectDir, ['propose', 'apply']);
    const parsed = await readConfigYaml(projectDir);
    expect(parsed.schema).toBe(SPEC_DRIVEN_WORKFLOW_SCHEMA);
  });

  it('does not mutate existing config.yaml content', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    const originalContent = 'schema: custom\ncontext: keep-me\n';
    await fs.writeFile(configPath, originalContent, 'utf-8');
    await ensureProjectConfigExistsForWorkflows(projectDir, ['brainstorm']);
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toBe(originalContent);
  });

  it('does not create config.yaml when config.yml already exists', async () => {
    const configYmlPath = path.join(projectDir, 'openspec', 'config.yml');
    await fs.mkdir(path.dirname(configYmlPath), { recursive: true });
    await fs.writeFile(configYmlPath, 'schema: custom\n', 'utf-8');
    await ensureProjectConfigExistsForWorkflows(projectDir, ['brainstorm']);

    await expect(fs.access(path.join(projectDir, 'openspec', 'config.yaml'))).rejects.toThrow();
  });

  it('treats EEXIST from async create-if-missing write as success', async () => {
    const openspecDir = path.join(projectDir, 'openspec');
    const configPath = path.join(openspecDir, 'config.yaml');
    await fs.mkdir(openspecDir, { recursive: true });

    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementationOnce(async (...args) => {
      await fs.writeFile(configPath, 'schema: external\ncontext: keep-me\n', 'utf-8');
      const error = new Error('EEXIST: file already exists') as NodeJS.ErrnoException;
      error.code = 'EEXIST';
      throw error;
    });

    await expect(
      ensureProjectConfigExistsForWorkflows(projectDir, ['brainstorm'])
    ).resolves.toBeUndefined();

    expect(await fs.readFile(configPath, 'utf-8')).toBe('schema: external\ncontext: keep-me\n');
    writeSpy.mockRestore();
  });

  it('sync creates config.yaml with brainstorm-root when missing and workflows include brainstorm', async () => {
    ensureProjectConfigExistsForWorkflowsSync(projectDir, [...BRAINSTORM_WORKFLOWS]);
    const parsed = await readConfigYaml(projectDir);
    expect(parsed.schema).toBe(BRAINSTORM_PROJECT_SCHEMA);
  });

  it('sync does not mutate existing config.yaml content', async () => {
    const configPath = path.join(projectDir, 'openspec', 'config.yaml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    const originalContent = 'schema: custom\ncontext: keep-me\n';
    await fs.writeFile(configPath, originalContent, 'utf-8');
    ensureProjectConfigExistsForWorkflowsSync(projectDir, ['brainstorm']);
    const content = await fs.readFile(configPath, 'utf-8');
    expect(content).toBe(originalContent);
  });

  it('sync does not create config.yaml when config.yml already exists', async () => {
    const configYmlPath = path.join(projectDir, 'openspec', 'config.yml');
    await fs.mkdir(path.dirname(configYmlPath), { recursive: true });
    await fs.writeFile(configYmlPath, 'schema: custom\n', 'utf-8');
    ensureProjectConfigExistsForWorkflowsSync(projectDir, ['brainstorm']);

    await expect(fs.access(path.join(projectDir, 'openspec', 'config.yaml'))).rejects.toThrow();
  });

});
