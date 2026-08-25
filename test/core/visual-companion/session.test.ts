import { describe, expect, it } from 'vitest';
import { buildForwardingInfo, detectRemoteEnvironment, parseVisualPort, readVisualEvents } from '../../../src/core/visual-companion/session.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('visual companion session helpers', () => {
  it('validates explicit ports and allows automatic selection', () => {
    expect(parseVisualPort(undefined)).toBe(0);
    expect(parseVisualPort('52341')).toBe(52341);
    expect(() => parseVisualPort('0')).toThrow('between 1 and 65535');
    expect(() => parseVisualPort('70000')).toThrow('between 1 and 65535');
    expect(() => parseVisualPort('abc')).toThrow('valid integer');
  });

  it('detects common remote environments', () => {
    expect(detectRemoteEnvironment({ SSH_CONNECTION: 'a b c d' })).toBe(true);
    expect(detectRemoteEnvironment({ VSCODE_IPC_HOOK_CLI: '/remote/.vscode-server/x' })).toBe(true);
    expect(detectRemoteEnvironment({ CODESPACES: 'true' })).toBe(true);
    expect(detectRemoteEnvironment({})).toBe(false);
  });

  it('builds authenticated forwarding guidance without guessing credentials', () => {
    const info = buildForwardingInfo(52341, 'secret');
    expect(info.localUrl).toBe('http://localhost:52341/?key=secret');
    expect(info.forwardingCommand).toBe('ssh -N -L 52341:127.0.0.1:52341 <remote-host>');
  });

  it('reads the latest visual choice for the agent', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-visual-'));
    fs.writeFileSync(path.join(stateDir, 'events.jsonl'), [
      JSON.stringify({ sessionId: 's', screen: 'options.html', choice: 'layout-b', timestamp: 2 }),
    ].join('\n'));

    expect(readVisualEvents(stateDir)).toEqual([
      { sessionId: 's', screen: 'options.html', choice: 'layout-b', timestamp: 2 },
    ]);
  });
});
