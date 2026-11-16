const ROOT = '/';

/** Drops a trailing slash so `/cases/` and `/cases` are one path. */
export function normalisePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed.length > 1 && trimmed.endsWith(ROOT)) return trimmed.slice(0, -1);
  return trimmed;
}

/** True when `path` is `routePath` or a page below it, matched on whole segments. */
export function pathIsUnder(path: string, routePath: string): boolean {
  if (path === routePath) return true;
  if (routePath === ROOT) return path.startsWith(ROOT);
  return path.startsWith(`${routePath}${ROOT}`);
}

/** A key-safe form of a path, for nav keys and testIDs. */
export function pathKey(path: string): string {
  return path.split(ROOT).filter((part) => part !== '').join('-');
}
