import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { installGlobalArtifacts } from '../../../src/core/global-artifacts/install.js';

describe('installGlobalArtifacts', () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
  });

  function fixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-global-install-'));
    roots.push(root);
    return {
      home: path.join(root, 'home'),
      recordPath: path.join(root, 'config', 'global-artifacts.json'),
    };
  }

  it('installs Codex skills without creating a project planning root', async () => {
    const { home, recordPath } = fixture();
    const cwd = path.join(home, 'repo');
    fs.mkdirSync(cwd, { recursive: true });

    const result = await installGlobalArtifacts({
      toolIds: ['codex'],
      context: { env: {}, platform: 'linux', homedir: home },
      recordPath,
      cwd,
      profile: 'core',
      delivery: 'both',
    });

    expect(result.installed).toEqual(['codex']);
    expect(fs.existsSync(path.join(cwd, 'openspec'))).toBe(false);
    expect(fs.readFileSync(path.join(home, '.agents', 'skills', 'openspec-propose', 'SKILL.md'), 'utf8'))
      .toContain('generatedBy:');
    expect(JSON.parse(fs.readFileSync(recordPath, 'utf8')).tools.codex.files.length).toBeGreaterThan(0);
  });

  it('maps Claude command adapter paths below the global command root', async () => {
    const { home, recordPath } = fixture();
    await installGlobalArtifacts({
      toolIds: ['claude'],
      context: { env: {}, platform: 'linux', homedir: home },
      recordPath,
      cwd: home,
      profile: 'core',
      delivery: 'both',
    });

    expect(fs.existsSync(path.join(home, '.claude', 'commands', 'opsx', 'propose.md'))).toBe(true);
    expect(fs.existsSync(path.join(home, '.claude', 'commands', '.claude'))).toBe(false);
  });

  it('rejects unsupported tools before writing a record', async () => {
    const { home, recordPath } = fixture();
    await expect(installGlobalArtifacts({
      toolIds: ['github-copilot'],
      context: { env: {}, platform: 'linux', homedir: home },
      recordPath,
      cwd: home,
      profile: 'core',
      delivery: 'both',
    })).rejects.toThrow('does not have a verified global path');
    expect(fs.existsSync(recordPath)).toBe(false);
  });

  it('preserves an unrelated file at a desired global destination', async () => {
    const { home, recordPath } = fixture();
    const destination = path.join(home, '.agents', 'skills', 'openspec-propose', 'SKILL.md');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, 'my personal skill\n');

    await expect(installGlobalArtifacts({
      toolIds: ['codex'],
      context: { env: {}, platform: 'linux', homedir: home },
      recordPath,
      cwd: home,
      profile: 'core',
      delivery: 'both',
    })).rejects.toThrow('not managed by OpenSpec');
    expect(fs.readFileSync(destination, 'utf8')).toBe('my personal skill\n');
    expect(fs.existsSync(recordPath)).toBe(false);
  });
});
