import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runCLI } from '../helpers/run-cli.js';

describe('global artifact CLI', () => {
  const roots: string[] = [];
  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
  });

  it('installs all globally capable tools without creating a project root', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-global-cli-'));
    roots.push(root);
    const home = path.join(root, 'home');
    const cwd = path.join(root, 'project');
    const configHome = path.join(root, 'config');
    await fs.mkdir(cwd, { recursive: true });

    const result = await runCLI(['init', '--scope', 'global', '--tools', 'all'], {
      cwd,
      env: { HOME: home, XDG_CONFIG_HOME: configHome },
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Global OpenSpec artifacts installed');
    expect(await fs.stat(path.join(home, '.agents', 'skills', 'openspec-propose', 'SKILL.md')))
      .toBeDefined();
    await expect(fs.stat(path.join(cwd, 'openspec'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects a positional project path at global scope', async () => {
    const result = await runCLI(['init', 'some-project', '--scope', 'global', '--tools', 'codex']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('does not accept a project path');
  });

  it('updates the tools recorded by global init', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-global-update-'));
    roots.push(root);
    const home = path.join(root, 'home');
    const cwd = path.join(root, 'project');
    const configHome = path.join(root, 'config');
    const env = { HOME: home, XDG_CONFIG_HOME: configHome };
    await fs.mkdir(cwd, { recursive: true });

    expect((await runCLI(['init', '--scope', 'global', '--tools', 'codex'], { cwd, env })).exitCode)
      .toBe(0);
    const skill = path.join(home, '.agents', 'skills', 'openspec-propose', 'SKILL.md');
    await fs.rm(skill);

    const result = await runCLI(['update', '--scope', 'global'], { cwd, env });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Global OpenSpec artifacts updated for: codex');
    expect(await fs.stat(skill)).toBeDefined();
  });

  it('guides global update users to initialize when no record exists', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-global-update-empty-'));
    roots.push(root);
    const result = await runCLI(['update', '--scope', 'global'], {
      cwd: root,
      env: { HOME: path.join(root, 'home'), XDG_CONFIG_HOME: path.join(root, 'config') },
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('init --scope global');
  });

  it('previews and applies project artifact cleanup without removing planning data', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-project-clean-'));
    roots.push(root);
    const configHome = path.join(root, 'config');
    const env = { XDG_CONFIG_HOME: configHome, HOME: path.join(root, 'home') };
    expect((await runCLI(['init', '--tools', 'claude', '--no-animation'], { cwd: root, env })).exitCode)
      .toBe(0);
    const skill = path.join(root, '.claude', 'skills', 'openspec-propose', 'SKILL.md');
    const command = path.join(root, '.claude', 'commands', 'opsx', 'propose.md');

    const globalInstall = await runCLI(
      ['init', '--scope', 'global', '--tools', 'claude'],
      { cwd: root, env }
    );
    expect(globalInstall.stdout).toContain('openspec clean --scope project --tools claude');

    const preview = await runCLI(['clean', '--scope', 'project', '--tools', 'claude'], { cwd: root, env });
    expect(preview.exitCode).toBe(0);
    expect(preview.stdout).toContain('Preview:');
    expect(await fs.stat(skill)).toBeDefined();
    expect(await fs.stat(command)).toBeDefined();

    const applied = await runCLI(
      ['clean', '--scope', 'project', '--tools', 'claude', '--yes'],
      { cwd: root, env }
    );
    expect(applied.exitCode).toBe(0);
    await expect(fs.stat(skill)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(fs.stat(command)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await fs.stat(path.join(root, 'openspec', 'config.yaml'))).toBeDefined();
  });
});
