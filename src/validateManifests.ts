import type { ModuleManifest } from './ModuleManifest';
import { normalisePath } from './paths';

function assertManifestShape(manifest: ModuleManifest): void {
  if (manifest.id.trim() === '') throw new Error('module-registry: a module has an empty id');
  if (manifest.roles.length === 0) throw new Error(`module-registry: module "${manifest.id}" lists no roles`);
  for (const route of manifest.routes)
    if (!normalisePath(route.path).startsWith('/'))
      throw new Error(`module-registry: route "${route.path}" in module "${manifest.id}" must start with "/"`);
}

/** Throws on an empty id, a module with no roles, a relative path, or a duplicate id or route path. */
export function validateManifests(manifests: readonly ModuleManifest[]): void {
  const ids = new Set<string>();
  const owners = new Map<string, string>();
  for (const manifest of manifests) {
    assertManifestShape(manifest);
    if (ids.has(manifest.id)) throw new Error(`module-registry: duplicate module id "${manifest.id}"`);
    ids.add(manifest.id);
    for (const route of manifest.routes) {
      const path = normalisePath(route.path);
      const owner = owners.get(path);
      if (owner !== undefined)
        throw new Error(`module-registry: duplicate route "${path}" in modules "${owner}" and "${manifest.id}"`);
      owners.set(path, manifest.id);
    }
  }
}
