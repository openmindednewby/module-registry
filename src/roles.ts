import type { ModuleManifest, ModuleRoute } from './ModuleManifest';

/** True when the user holds at least one of the required roles. */
export function hasAnyRole(required: readonly string[], userRoles: readonly string[]): boolean {
  return required.some((role) => userRoles.includes(role));
}

/** The roles a route demands: its own, or the module's when it lists none. */
export function effectiveRouteRoles(manifest: ModuleManifest, route: ModuleRoute): readonly string[] {
  return route.roles.length > 0 ? route.roles : manifest.roles;
}

/** True when the user passes the module gate and the route's own roles. */
export function canOpenRoute(manifest: ModuleManifest, route: ModuleRoute, userRoles: readonly string[]): boolean {
  return hasAnyRole(manifest.roles, userRoles) && hasAnyRole(effectiveRouteRoles(manifest, route), userRoles);
}
