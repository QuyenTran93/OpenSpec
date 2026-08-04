import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseInstallScope } from '../../../src/core/install-scope.js';
import {
  getGlobalCapableToolIds,
  getGlobalToolCapability,
} from '../../../src/core/global-artifacts/capabilities.js';
import { assertContainedPath } from '../../../src/core/global-artifacts/paths.js';

describe('global artifact paths', () => {
  const context = {
    env: {},
    platform: 'linux' as const,
    homedir: path.resolve('fixture-home'),
  };

  it('keeps project installation as the default scope', () => {
    expect(parseInstallScope()).toBe('project');
    expect(parseInstallScope('global')).toBe('global');
    expect(() => parseInstallScope('system')).toThrow('project or global');
  });

  it('declares every verified global tool explicitly', () => {
    expect(getGlobalCapableToolIds(context)).toEqual([
      'claude',
      'codex',
      'cursor',
      'gemini',
      'hermes',
    ]);
  });

  it('uses the current Codex user skill location instead of its legacy project directory', () => {
    expect(getGlobalToolCapability('codex', context)).toEqual({
      toolId: 'codex',
      skillsRoot: path.join(context.homedir, '.agents', 'skills'),
    });
  });

  it('declares independently verified skill and command surfaces', () => {
    expect(getGlobalToolCapability('gemini', context)).toEqual({
      toolId: 'gemini',
      skillsRoot: path.join(context.homedir, '.gemini', 'skills'),
      commandsRoot: path.join(context.homedir, '.gemini', 'commands'),
    });
    expect(getGlobalToolCapability('github-copilot', context)).toBeUndefined();
  });

  it('rejects destinations outside or equal to a declared root', () => {
    const root = path.join(context.homedir, '.claude', 'skills');
    expect(assertContainedPath(root, path.join(root, 'openspec-propose', 'SKILL.md'))).toBeUndefined();
    expect(() => assertContainedPath(root, root)).toThrow('inside');
    expect(() => assertContainedPath(root, path.join(root, '..', 'settings.json'))).toThrow('inside');
  });
});
