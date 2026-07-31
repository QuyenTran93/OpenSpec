import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { VisualSessionInfo } from './types.js';

export function parseVisualPort(value?: string): number {
  if (value === undefined) return 0;
  if (!/^\d+$/.test(value)) throw new Error('Port must be a valid integer');
  const port = Number(value);
  if (port < 1 || port > 65535) throw new Error('Port must be between 1 and 65535');
  return port;
}

export function detectRemoteEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.SSH_CONNECTION ||
    env.SSH_CLIENT ||
    env.CODESPACES === 'true' ||
    env.REMOTE_CONTAINERS ||
    env.VSCODE_REMOTE_NAME ||
    env.VSCODE_IPC_HOOK_CLI?.includes('.vscode-server')
  );
}

export function buildForwardingInfo(port: number, key: string) {
  return {
    localUrl: `http://localhost:${port}/?key=${key}`,
    forwardingCommand: `ssh -N -L ${port}:127.0.0.1:${port} <remote-host>`,
  };
}

export function visualRoot(projectPath: string): string {
  return path.join(path.resolve(projectPath), '.openspec', 'visual-companion');
}

export function createVisualSession(projectPath: string, requestedPort: number) {
  const root = visualRoot(projectPath);
  const sessionId = `${process.pid}-${Date.now()}`;
  const sessionDir = path.join(root, sessionId);
  const screenDir = path.join(sessionDir, 'content');
  const stateDir = path.join(sessionDir, 'state');
  fs.mkdirSync(screenDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  return {
    sessionId,
    sessionDir,
    screenDir,
    stateDir,
    requestedPort,
    key: crypto.randomBytes(32).toString('base64url'),
  };
}

export function readLatestSession(projectPath: string): VisualSessionInfo | null {
  const root = visualRoot(projectPath);
  if (!fs.existsSync(root)) return null;
  const dirs = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const dir of dirs) {
    const infoPath = path.join(dir, 'state', 'server-info.json');
    if (!fs.existsSync(infoPath)) continue;
    try {
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf8')) as VisualSessionInfo;
      process.kill(info.pid, 0);
      return info;
    } catch {
      continue;
    }
  }
  return null;
}
