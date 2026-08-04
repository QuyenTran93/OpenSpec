import path from 'node:path';

export function assertContainedPath(root: string, destination: string): void {
  if (!path.isAbsolute(root) || !path.isAbsolute(destination)) {
    throw new Error('Global artifact roots and destinations must be absolute.');
  }
  const relative = path.relative(path.resolve(root), path.resolve(destination));
  const contained =
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative);
  if (!contained) {
    throw new Error(`Global artifact destination must be inside its declared root: ${destination}`);
  }
}
