import path from 'node:path';
import type { Command } from 'commander';
import { AI_TOOLS, resolveToolIdAlias } from '../core/config.js';
import {
  applyProjectArtifactCleanup,
  discoverProjectArtifacts,
} from '../core/global-artifacts/project-cleanup.js';

export function registerCleanCommand(program: Command): void {
  program
    .command('clean')
    .description('Preview or remove generated OpenSpec AI-tool artifacts')
    .requiredOption('--scope <scope>', 'Cleanup scope (project)')
    .option('--tools <tools>', 'Use all or a comma-separated tool list', 'all')
    .option('--yes', 'Apply cleanup; default is preview only')
    .option('--json', 'Output JSON')
    .action(async (options: { scope: string; tools: string; yes?: boolean; json?: boolean }) => {
      if (options.scope !== 'project') throw new Error('Clean currently supports only --scope project.');
      const available = AI_TOOLS.filter((tool) => tool.skillsDir).map((tool) => tool.value);
      const tools = options.tools === 'all'
        ? available
        : options.tools.split(',').map((id) => resolveToolIdAlias(id.trim()));
      const invalid = tools.filter((tool) => !available.includes(tool));
      if (invalid.length > 0) throw new Error(`Invalid tool(s): ${invalid.join(', ')}`);
      const root = process.cwd();
      let plan = await discoverProjectArtifacts(root, tools);
      if (options.yes) plan = await applyProjectArtifactCleanup(root, plan);
      if (options.json) {
        console.log(JSON.stringify(plan, null, 2));
        return;
      }
      console.log(options.yes ? `Removed: ${plan.removed.length} generated artifact(s)` : 'Preview:');
      for (const filePath of plan.removable) console.log(`  ${path.relative(root, filePath)}`);
      if (!options.yes && plan.removable.length > 0) {
        console.log('Run again with --yes to remove these files. This may affect collaborators without a global install.');
      }
      for (const filePath of plan.preserved) console.log(`  Preserved: ${path.relative(root, filePath)}`);
    });
}
