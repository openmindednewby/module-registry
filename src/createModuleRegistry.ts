import type { ModuleManifest, ModuleRoute } from './ModuleManifest';
import type { ModuleNavGroup, ModuleNavItem, ModuleSession } from './ModuleNav';
import { normalisePath, pathIsUnder, pathKey } from './paths';
import { canOpenRoute, hasAnyRole } from './roles';
import { RouteAccess } from './RouteAccess';
import { validateManifests } from './validateManifests';

export interface ModuleRegistry<TApiClient = unknown> {
  readonly modules: readonly ModuleManifest<TApiClient>[];
  navGroups(userRoles: readonly string[]): ModuleNavGroup[];
  navItems(userRoles: readonly string[]): ModuleNavItem[];
  canAccess(path: string, userRoles: readonly string[]): boolean;
  routeAccess(path: string, session: ModuleSession): RouteAccess;
}

interface OwnedRoute {
  manifest: ModuleManifest;
  route: ModuleRoute;
  path: string;
}

function toNavItem(manifest: ModuleManifest, route: ModuleRoute): ModuleNavItem {
  const path = normalisePath(route.path);
  const item: ModuleNavItem = { key: `nav-${manifest.id}-${pathKey(path)}`, label: route.label, route: path };
  if (route.icon !== undefined) item.icon = route.icon;
  return item;
}

function toNavGroup(manifest: ModuleManifest, userRoles: readonly string[]): ModuleNavGroup | null {
  if (!hasAnyRole(manifest.roles, userRoles)) return null;
  const items = manifest.routes
    .filter((route) => canOpenRoute(manifest, route, userRoles))
    .map((route) => toNavItem(manifest, route));
  if (items.length === 0) return null;
  const { label, order } = manifest.navGroup;
  return { key: `group-${manifest.id}`, moduleId: manifest.id, label, order, items };
}

function byOrderThenLabel(a: ModuleNavGroup, b: ModuleNavGroup): number {
  return a.order !== b.order ? a.order - b.order : a.label.localeCompare(b.label);
}

function findOwnedRoute(owned: readonly OwnedRoute[], path: string): OwnedRoute | undefined {
  const target = normalisePath(path);
  const matches = owned.filter((entry) => pathIsUnder(target, entry.path));
  return matches.sort((a, b) => b.path.length - a.path.length)[0];
}

function isGroup(group: ModuleNavGroup | null): group is ModuleNavGroup {
  return group !== null;
}

/** Builds a registry; throws on a duplicate module id or route path. */
export function createModuleRegistry<TApiClient = unknown>(
  manifests: readonly ModuleManifest<TApiClient>[],
): ModuleRegistry<TApiClient> {
  validateManifests(manifests);
  const modules = [...manifests];
  const owned: OwnedRoute[] = modules.flatMap((manifest) =>
    manifest.routes.map((route) => ({ manifest, route, path: normalisePath(route.path) })),
  );

  const navGroups = (userRoles: readonly string[]): ModuleNavGroup[] =>
    modules.map((manifest) => toNavGroup(manifest, userRoles)).filter(isGroup).sort(byOrderThenLabel);

  const canAccess = (path: string, userRoles: readonly string[]): boolean => {
    const entry = findOwnedRoute(owned, path);
    return entry !== undefined && canOpenRoute(entry.manifest, entry.route, userRoles);
  };

  return {
    modules,
    navGroups,
    navItems: (userRoles) =>
      navGroups(userRoles).flatMap((group) => [
        { key: group.key, label: group.label, route: '', groupHeader: true },
        ...group.items,
      ]),
    canAccess,
    routeAccess: (path, session) => {
      if (session.loading && session.roles === null) return RouteAccess.Loading;
      return canAccess(path, session.roles ?? []) ? RouteAccess.Allowed : RouteAccess.Denied;
    },
  };
}
