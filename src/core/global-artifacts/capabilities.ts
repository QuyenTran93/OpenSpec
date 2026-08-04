import path from 'node:path';

export interface GlobalPathContext {
  env: NodeJS.ProcessEnv;
  platform: NodeJS.Platform;
  homedir: string;
}

export interface GlobalToolCapability {
  toolId: string;
  skillsRoot?: string;
  commandsRoot?: string;
}

type RootSpec = {
  skills?: string[];
  commands?: string[];
};

// Each entry is intentionally explicit. Sources:
// - Claude Code: user skills/commands under ~/.claude.
// - Codex: USER skills at $HOME/.agents/skills (Codex manual, Build skills).
// - Cursor: user skills/commands under ~/.cursor.
// - Gemini CLI: user skills and custom commands under ~/.gemini.
// - Hermes: user skills under ~/.hermes/skills (also documented in config.ts).
const VERIFIED_GLOBAL_ROOTS: Record<string, RootSpec> = {
  claude: { skills: ['.claude', 'skills'], commands: ['.claude', 'commands'] },
  codex: { skills: ['.agents', 'skills'] },
  cursor: { skills: ['.cursor', 'skills'], commands: ['.cursor', 'commands'] },
  gemini: { skills: ['.gemini', 'skills'], commands: ['.gemini', 'commands'] },
  hermes: { skills: ['.hermes', 'skills'] },
};

export function getGlobalToolCapability(
  toolId: string,
  context: GlobalPathContext
): GlobalToolCapability | undefined {
  const spec = VERIFIED_GLOBAL_ROOTS[toolId];
  if (!spec) return undefined;
  return {
    toolId,
    ...(spec.skills ? { skillsRoot: path.resolve(context.homedir, ...spec.skills) } : {}),
    ...(spec.commands ? { commandsRoot: path.resolve(context.homedir, ...spec.commands) } : {}),
  };
}

export function getGlobalCapableToolIds(context: GlobalPathContext): string[] {
  return Object.keys(VERIFIED_GLOBAL_ROOTS)
    .filter((toolId) => getGlobalToolCapability(toolId, context) !== undefined)
    .sort();
}
