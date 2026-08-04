import fs from 'node:fs/promises';
import path from 'node:path';
import { getGlobalConfigDir } from '../global-config.js';
import { installGlobalArtifacts, type GlobalArtifactRecord } from './install.js';
import type { GlobalPathContext } from './capabilities.js';

export async function updateGlobalArtifacts(options: {
  context: GlobalPathContext;
  recordPath?: string;
  cwd?: string;
}): Promise<{ installed: string[]; recordPath: string }> {
  const recordPath = options.recordPath ?? path.join(getGlobalConfigDir(), 'global-artifacts.json');
  let record: GlobalArtifactRecord;
  try {
    record = JSON.parse(await fs.readFile(recordPath, 'utf8')) as GlobalArtifactRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('No global installation record found. Run openspec init --scope global --tools <tools> first.');
    }
    throw new Error(`Cannot read global installation record at ${recordPath}: ${(error as Error).message}`);
  }
  if (record.version !== 1 || !record.tools || typeof record.tools !== 'object') {
    throw new Error(`Unsupported global installation record at ${recordPath}.`);
  }
  return installGlobalArtifacts({
    toolIds: Object.keys(record.tools),
    context: options.context,
    recordPath,
    cwd: options.cwd,
  });
}
