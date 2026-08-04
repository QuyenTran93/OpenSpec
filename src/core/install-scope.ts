export type InstallScope = 'project' | 'global';

export function parseInstallScope(value?: string): InstallScope {
  if (value === undefined || value === 'project') return 'project';
  if (value === 'global') return 'global';
  throw new Error(`Invalid install scope '${value}'. Expected project or global.`);
}
