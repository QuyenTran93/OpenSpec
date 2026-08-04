import fs from 'node:fs/promises';
import path from 'node:path';
import { AI_TOOLS } from '../config.js';
import { CommandAdapterRegistry, generateCommands } from '../command-generation/index.js';
import { getCommandContents } from '../shared/index.js';
import { assertContainedPath } from './paths.js';

export interface ProjectArtifactCleanupPlan {
  scope: 'project';
  tools: string[];
  removable: string[];
  preserved: string[];
  removed: string[];
}

async function readable(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function discoverProjectArtifacts(
  projectRoot: string,
  toolIds: string[]
): Promise<ProjectArtifactCleanupPlan> {
  const removable: string[] = [];
  const preserved: string[] = [];

  for (const toolId of toolIds) {
    const tool = AI_TOOLS.find((candidate) => candidate.value === toolId);
    if (!tool?.skillsDir) continue;
    const toolRoot = path.resolve(projectRoot, tool.skillsDir);
    const skillsRoot = path.join(toolRoot, 'skills');
    try {
      for (const entry of await fs.readdir(skillsRoot, { withFileTypes: true })) {
        if (!entry.isDirectory() || !entry.name.startsWith('openspec-')) continue;
        const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md');
        assertContainedPath(toolRoot, skillFile);
        const content = await readable(skillFile);
        if (content === null) continue;
        (/^\s*generatedBy:\s*["']?[^\n"']+/m.test(content) ? removable : preserved).push(skillFile);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }

    const adapter = CommandAdapterRegistry.get(toolId);
    if (!adapter) continue;
    const expectedByPath = new Map<string, Set<string>>();
    for (const profile of ['core', 'brainstorm'] as const) {
      for (const command of generateCommands(getCommandContents(undefined, profile), adapter)) {
        const commandPath = path.resolve(projectRoot, command.path);
        const variants = expectedByPath.get(commandPath) ?? new Set<string>();
        variants.add(command.fileContent);
        expectedByPath.set(commandPath, variants);
      }
    }
    for (const [commandPath, expectedVariants] of expectedByPath) {
      assertContainedPath(toolRoot, commandPath);
      const content = await readable(commandPath);
      if (content === null) continue;
      (expectedVariants.has(content) ? removable : preserved).push(commandPath);
    }
  }

  return { scope: 'project', tools: toolIds, removable, preserved, removed: [] };
}

async function removeEmptyParents(filePath: string, stopAt: string): Promise<void> {
  let current = path.dirname(filePath);
  while (current !== stopAt && current.startsWith(`${stopAt}${path.sep}`)) {
    try {
      await fs.rmdir(current);
    } catch {
      return;
    }
    current = path.dirname(current);
  }
}

export async function applyProjectArtifactCleanup(
  projectRoot: string,
  plan: ProjectArtifactCleanupPlan
): Promise<ProjectArtifactCleanupPlan> {
  const removed: string[] = [];
  for (const filePath of plan.removable) {
    const tool = AI_TOOLS.find((candidate) =>
      candidate.skillsDir && filePath.startsWith(`${path.resolve(projectRoot, candidate.skillsDir)}${path.sep}`)
    );
    if (!tool?.skillsDir || !plan.tools.includes(tool.value)) continue;
    const toolRoot = path.resolve(projectRoot, tool.skillsDir);
    assertContainedPath(toolRoot, filePath);
    await fs.rm(filePath);
    removed.push(filePath);
    await removeEmptyParents(filePath, toolRoot);
  }
  return { ...plan, removed };
}
