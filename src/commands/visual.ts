import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { Command } from 'commander';
import { createVisualSession, detectRemoteEnvironment, parseVisualPort, readLatestSession } from '../core/visual-companion/session.js';
import { serveVisualSession } from '../core/visual-companion/server.js';

async function waitForInfo(infoPath: string) {
  const errorPath = path.join(path.dirname(infoPath), 'server-error.txt');
  for (let i = 0; i < 60; i++) {
    if (fs.existsSync(infoPath)) return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    if (fs.existsSync(errorPath)) throw new Error(fs.readFileSync(errorPath, 'utf8'));
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Visual companion did not start');
}

function printInfo(info: any, json: boolean): void {
  if (json) { console.log(JSON.stringify(info)); return; }
  console.log(`Visual companion: ${info.remote ? info.localUrl : info.url}`);
  if (info.forwardingRequired) {
    console.log(`Forward remote port ${info.port} in your IDE Ports panel, or run:`);
    console.log(`  ${info.forwardingCommand}`);
    console.log(`Then open: ${info.localUrl}`);
  }
  console.log(`Screens: ${info.screenDir}`);
  console.log(`Events: ${path.join(info.stateDir, 'events.jsonl')}`);
}

export function registerVisualCommand(program: Command): void {
  const visual = program.command('visual').description('Run the optional local visual brainstorming companion');
  visual.command('start')
    .option('--project <path>', 'Project root', '.')
    .option('--port <port>', 'Fixed remote/listening port')
    .option('--open', 'Open the browser when running locally')
    .option('--json', 'Output one JSON document')
    .action(async (options) => {
      const requestedPort = parseVisualPort(options.port);
      const session = createVisualSession(options.project, requestedPort);
      const bootstrapPath = path.join(session.stateDir, 'bootstrap.json');
      fs.writeFileSync(bootstrapPath, JSON.stringify({ ...session, idleMinutes: 240 }), { mode: 0o600 });
      const child = spawn(process.execPath, [process.argv[1], 'visual', 'serve', '--bootstrap', bootstrapPath], { detached: true, stdio: 'ignore' });
      child.unref();
      const info = await waitForInfo(path.join(session.stateDir, 'server-info.json'));
      printInfo(info, Boolean(options.json));
      if (options.open && !detectRemoteEnvironment()) {
        const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
        const args = process.platform === 'win32' ? ['/c', 'start', '', info.url] : [info.url];
        spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
      }
    });
  visual.command('status').option('--project <path>', 'Project root', '.').option('--json').action((options) => {
    const info = readLatestSession(options.project);
    if (!info) throw new Error('No running visual companion session');
    printInfo(info, Boolean(options.json));
  });
  visual.command('stop').option('--project <path>', 'Project root', '.').option('--json').action(async (options) => {
    const info = readLatestSession(options.project);
    if (!info) throw new Error('No running visual companion session');
    const shutdownUrl = new URL('/shutdown', info.url);
    shutdownUrl.searchParams.set('key', new URL(info.url).searchParams.get('key') ?? '');
    const response = await fetch(shutdownUrl, { method: 'POST' });
    if (!response.ok) throw new Error('Visual companion session did not authenticate shutdown');
    const result = { stopped: true, pid: info.pid, sessionDir: info.sessionDir };
    if (options.json) console.log(JSON.stringify(result)); else console.log(`Stopped visual companion (pid ${info.pid}).`);
  });
  visual.command('serve', { hidden: true }).requiredOption('--bootstrap <path>').action(async (options) => {
    try {
      await serveVisualSession(options.bootstrap);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fs.writeFileSync(path.join(path.dirname(options.bootstrap), 'server-error.txt'), message, { mode: 0o600 });
      throw error;
    }
  });
}
