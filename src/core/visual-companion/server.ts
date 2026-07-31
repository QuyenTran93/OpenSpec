import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { URL } from 'node:url';
import { VISUAL_FRAME } from './frame.js';
import { VISUAL_HELPER } from './helper.js';
import { sanitizeVisualFragment } from './sanitize.js';
import { buildForwardingInfo, detectRemoteEnvironment } from './session.js';
import { MAX_EVENT_BYTES, MAX_SCREEN_BYTES, type VisualEvent, type VisualSessionInfo } from './types.js';

interface Bootstrap { sessionId: string; sessionDir: string; screenDir: string; stateDir: string; key: string; requestedPort: number; idleMinutes: number }

function securityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), accelerometer=()',
    'Cache-Control': 'no-store',
  };
}

function newestScreen(screenDir: string): { name: string; content: string } {
  const files = fs.readdirSync(screenDir).filter((name) => name.endsWith('.html'))
    .map((name) => ({ name, mtime: fs.statSync(path.join(screenDir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files[0]) return { name: 'waiting', content: '<div class="waiting"><h2>Visual companion ready</h2><p>Waiting for the first visual question…</p></div>' };
  const target = path.resolve(screenDir, files[0].name);
  const realRoot = fs.realpathSync(screenDir);
  const realTarget = fs.realpathSync(target);
  if (!realTarget.startsWith(`${realRoot}${path.sep}`)) throw new Error('Screen path escapes session');
  const stat = fs.statSync(realTarget);
  if (stat.size > MAX_SCREEN_BYTES) throw new Error('Screen exceeds size limit');
  return { name: files[0].name, content: sanitizeVisualFragment(fs.readFileSync(realTarget, 'utf8')) };
}

function websocketFrame(text: string): Buffer {
  const payload = Buffer.from(text);
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  const header = Buffer.alloc(4); header[0] = 0x81; header[1] = 126; header.writeUInt16BE(payload.length, 2);
  return Buffer.concat([header, payload]);
}

function decodeClientFrame(buffer: Buffer): string | null {
  if (buffer.length < 6 || (buffer[0] & 0x80) === 0 || (buffer[0] & 0x0f) !== 1 || (buffer[1] & 0x80) === 0) return null;
  let length = buffer[1] & 0x7f; let offset = 2;
  if (length === 126) { if (buffer.length < 8) return null; length = buffer.readUInt16BE(2); offset = 4; }
  if (length > MAX_EVENT_BYTES || buffer.length < offset + 4 + length) return null;
  const mask = buffer.subarray(offset, offset + 4); offset += 4;
  const payload = Buffer.alloc(length);
  for (let i = 0; i < length; i++) payload[i] = buffer[offset + i] ^ mask[i % 4];
  return payload.toString('utf8');
}

export async function serveVisualSession(bootstrapPath: string): Promise<void> {
  const bootstrap = JSON.parse(fs.readFileSync(bootstrapPath, 'utf8')) as Bootstrap;
  fs.rmSync(bootstrapPath, { force: true });
  const sockets = new Set<import('node:stream').Duplex>();
  let latest = newestScreen(bootstrap.screenDir);
  let lastActivity = Date.now();
  let requestStop = () => {};
  const server = http.createServer((req, res) => {
    lastActivity = Date.now();
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.searchParams.get('key') !== bootstrap.key && req.headers.cookie !== `visual_key=${bootstrap.key}`) {
      res.writeHead(403, securityHeaders()).end('Forbidden'); return;
    }
    const headers = securityHeaders();
    if (url.pathname === '/shutdown' && req.method === 'POST') {
      res.writeHead(202, headers).end('Stopping');
      setImmediate(requestStop);
      return;
    }
    if (url.pathname === '/helper.js') {
      res.writeHead(200, { ...headers, 'Content-Type': 'text/javascript; charset=utf-8' }).end(VISUAL_HELPER); return;
    }
    if (url.pathname !== '/') { res.writeHead(404, headers).end('Not found'); return; }
    latest = newestScreen(bootstrap.screenDir);
    res.writeHead(200, { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': `visual_key=${bootstrap.key}; HttpOnly; SameSite=Strict; Path=/` });
    res.end(VISUAL_FRAME(latest.content, `/helper.js?key=${encodeURIComponent(bootstrap.key)}`));
  });

  server.on('upgrade', (req, socket) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const wsKey = req.headers['sec-websocket-key'];
    const host = (req.headers.host ?? '').split(':')[0];
    let originHost = '';
    try { originHost = req.headers.origin ? new URL(req.headers.origin).hostname : ''; } catch { socket.destroy(); return; }
    const localHost = host === '127.0.0.1' || host === 'localhost';
    const localOrigin = !originHost || originHost === '127.0.0.1' || originHost === 'localhost';
    if (!localHost || !localOrigin || url.pathname !== '/events' || url.searchParams.get('key') !== bootstrap.key || typeof wsKey !== 'string') { socket.destroy(); return; }
    const accept = crypto.createHash('sha1').update(`${wsKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    sockets.add(socket); lastActivity = Date.now();
    socket.on('data', (data) => {
      lastActivity = Date.now();
      const text = decodeClientFrame(data); if (!text) return;
      try {
        const input = JSON.parse(text) as { type?: string; choice?: string };
        if (input.type !== 'choice' || typeof input.choice !== 'string' || input.choice.length > 128) return;
        const event: VisualEvent = { sessionId: bootstrap.sessionId, screen: latest.name, choice: input.choice, timestamp: Date.now() };
        fs.appendFileSync(path.join(bootstrap.stateDir, 'events.jsonl'), `${JSON.stringify(event)}\n`, { mode: 0o600 });
      } catch { /* ignore malformed client messages */ }
    });
    socket.on('close', () => sockets.delete(socket)); socket.on('error', () => sockets.delete(socket));
  });

  const watcher = fs.watch(bootstrap.screenDir, () => {
    try { latest = newestScreen(bootstrap.screenDir); for (const socket of sockets) socket.write(websocketFrame('reload')); } catch { /* next valid screen wins */ }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(bootstrap.requestedPort, '127.0.0.1', () => {
      const address = server.address(); if (!address || typeof address === 'string') return reject(new Error('Unable to resolve visual server port'));
      const remote = detectRemoteEnvironment(); const forward = buildForwardingInfo(address.port, bootstrap.key);
      const info: VisualSessionInfo = { sessionDir: bootstrap.sessionDir, screenDir: bootstrap.screenDir, stateDir: bootstrap.stateDir, url: `http://127.0.0.1:${address.port}/?key=${bootstrap.key}`, host: '127.0.0.1', port: address.port, pid: process.pid, remote, forwardingRequired: remote, localUrl: forward.localUrl, ...(remote ? { forwardingCommand: forward.forwardingCommand } : {}) };
      const infoPath = path.join(bootstrap.stateDir, 'server-info.json');
      const temporaryInfoPath = `${infoPath}.${process.pid}.tmp`;
      fs.writeFileSync(temporaryInfoPath, JSON.stringify(info, null, 2), { mode: 0o600 });
      fs.renameSync(temporaryInfoPath, infoPath);
    });
    const timer = setInterval(() => { if (Date.now() - lastActivity > bootstrap.idleMinutes * 60_000) { clearInterval(timer); watcher.close(); for (const socket of sockets) socket.destroy(); server.close(() => resolve()); } }, 30_000);
    const stop = () => { clearInterval(timer); watcher.close(); for (const socket of sockets) socket.destroy(); server.close(() => resolve()); };
    requestStop = stop;
    process.once('SIGTERM', stop); process.once('SIGINT', stop);
  });
}
