import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { AI_TOOLS } from '../config.js';
import { CommandAdapterRegistry, generateCommands } from '../command-generation/index.js';
import {
  resolveCommandInvocation,
  resolveCommandSurfaceCapability,
  shouldGenerateCommandsForTool,
  shouldGenerateSkillsForTool,
} from '../command-surface.js';
import { getGlobalConfig, getGlobalConfigDir, type Delivery, type Profile } from '../global-config.js';
import { getProfileWorkflows } from '../profiles.js';
import { generateSkillContent, getCommandContents, getSkillTemplates } from '../shared/index.js';
import { getTransformerForTool } from '../../utils/command-references.js';
import { assertContainedPath } from './paths.js';
import {
  getGlobalToolCapability,
  type GlobalPathContext,
} from './capabilities.js';

const require = createRequire(import.meta.url);
const { version: OPENSPEC_VERSION } = require('../../../package.json') as { version: string };

export interface GlobalArtifactRecord {
  version: 1;
  generatorVersion: string;
  profile: Profile;
  delivery: Delivery;
  tools: Record<string, { files: string[] }>;
}

export interface InstallGlobalArtifactsOptions {
  toolIds: string[];
  context?: GlobalPathContext;
  recordPath?: string;
  cwd?: string;
  profile?: Profile;
  delivery?: Delivery;
}

export interface InstallGlobalArtifactsResult {
  installed: string[];
  recordPath: string;
}

function defaultContext(): GlobalPathContext {
  return { env: process.env, platform: process.platform, homedir: os.homedir() };
}

function commandDestination(commandsRoot: string, adapterPath: string): string {
  const parts = adapterPath.split(/[\\/]/);
  const commandsIndex = parts.lastIndexOf('commands');
  const promptsIndex = parts.lastIndexOf('prompts');
  const workflowsIndex = parts.lastIndexOf('workflows');
  const surfaceIndex = Math.max(commandsIndex, promptsIndex, workflowsIndex);
  if (surfaceIndex < 0 || surfaceIndex === parts.length - 1) {
    throw new Error(`Cannot map command path '${adapterPath}' into global command root.`);
  }
  return path.join(commandsRoot, ...parts.slice(surfaceIndex + 1));
}

async function writeManagedFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

async function previousManagedPaths(recordPath: string): Promise<Set<string>> {
  try {
    const record = JSON.parse(await fs.readFile(recordPath, 'utf8')) as Partial<GlobalArtifactRecord>;
    return new Set(
      Object.values(record.tools ?? {}).flatMap((tool) =>
        Array.isArray(tool.files) ? tool.files : []
      )
    );
  } catch {
    return new Set();
  }
}

async function assertWritableManagedFile(
  filePath: string,
  desiredContent: string,
  previouslyManaged: Set<string>
): Promise<void> {
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    const generated = /^\s*generatedBy:\s*["']?[^\n"']+/m.test(existing);
    if (!generated && existing !== desiredContent && !previouslyManaged.has(filePath)) {
      throw new Error(`Destination exists and is not managed by OpenSpec: ${filePath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
}

export async function installGlobalArtifacts(
  options: InstallGlobalArtifactsOptions
): Promise<InstallGlobalArtifactsResult> {
  const context = options.context ?? defaultContext();
  const recordPath = options.recordPath ?? path.join(getGlobalConfigDir(), 'global-artifacts.json');
  const config = getGlobalConfig();
  const profile = options.profile ?? config.profile ?? 'core';
  const delivery = options.delivery ?? config.delivery ?? 'both';
  const workflows = getProfileWorkflows(profile, config.workflows);

  const capabilities = options.toolIds.map((toolId) => {
    const capability = getGlobalToolCapability(toolId, context);
    if (!capability) throw new Error(`Tool '${toolId}' does not have a verified global path.`);
    return capability;
  });

  const record: GlobalArtifactRecord = {
    version: 1,
    generatorVersion: OPENSPEC_VERSION,
    profile,
    delivery,
    tools: {},
  };
  const desiredFiles: Array<{ path: string; content: string }> = [];

  for (const capability of capabilities) {
    const tool = AI_TOOLS.find((candidate) => candidate.value === capability.toolId);
    if (!tool) throw new Error(`Unknown tool '${capability.toolId}'.`);
    const files: string[] = [];

    if (capability.skillsRoot && shouldGenerateSkillsForTool(tool.value, delivery)) {
      const transformer = getTransformerForTool(
        tool.value,
        delivery,
        resolveCommandSurfaceCapability(tool.value),
        resolveCommandInvocation(tool.value)
      );
      for (const { template, dirName } of getSkillTemplates(workflows, profile)) {
        const destination = path.join(capability.skillsRoot, dirName, 'SKILL.md');
        assertContainedPath(capability.skillsRoot, destination);
        const content = generateSkillContent(template, OPENSPEC_VERSION, transformer);
        desiredFiles.push({ path: destination, content });
        files.push(destination);
      }
    }

    if (capability.commandsRoot && shouldGenerateCommandsForTool(tool.value, delivery)) {
      const adapter = CommandAdapterRegistry.get(tool.value);
      if (adapter) {
        for (const command of generateCommands(getCommandContents(workflows, profile), adapter)) {
          const destination = commandDestination(capability.commandsRoot, command.path);
          assertContainedPath(capability.commandsRoot, destination);
          desiredFiles.push({ path: destination, content: command.fileContent });
          files.push(destination);
        }
      }
    }

    record.tools[tool.value] = { files };
  }

  const previouslyManaged = await previousManagedPaths(recordPath);
  for (const file of desiredFiles) {
    await assertWritableManagedFile(file.path, file.content, previouslyManaged);
  }
  for (const file of desiredFiles) {
    await writeManagedFile(file.path, file.content);
  }

  await fs.mkdir(path.dirname(recordPath), { recursive: true });
  const temporaryPath = `${recordPath}.${process.pid}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, recordPath);
  return { installed: Object.keys(record.tools), recordPath };
}
