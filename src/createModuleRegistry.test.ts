import { createModuleRegistry } from './createModuleRegistry';
import type { ModuleManifest } from './ModuleManifest';
import { RouteAccess } from './RouteAccess';

const REVIEWER = 'reviewer';
const OPERATOR = 'operator';

const reviewModule: ModuleManifest = {
  id: 'review',
  navGroup: { label: 'Review', order: 20 },
  roles: [REVIEWER, OPERATOR],
  routes: [
    { path: '/cases', label: 'Cases', roles: [], icon: 'folder' },
    { path: '/cases/settings', label: 'Settings', roles: [OPERATOR] },
  ],
};

const moduleD: ModuleManifest = {
  id: 'module-d',
  navGroup: { label: 'Module D', order: 10 },
  roles: [OPERATOR],
  routes: [{ path: '/module-d/home/', label: 'Home', roles: [] }],
};

describe('createModuleRegistry', () => {
  it('with a new module manifest and no shell edit, lists its group and route first by order', () => {
    const registry = createModuleRegistry([reviewModule, moduleD]);

    const groups = registry.navGroups([OPERATOR]);

    expect(groups.map((group) => group.label)).toEqual(['Module D', 'Review']);
    expect(groups[0].items).toEqual([{ key: 'nav-module-d-module-d-home', label: 'Home', route: '/module-d/home' }]);
  });

  it('with no role the module lists, hides the whole group', () => {
    const registry = createModuleRegistry([reviewModule, moduleD]);

    const groups = registry.navGroups([REVIEWER]);

    expect(groups.map((group) => group.moduleId)).toEqual(['review']);
  });

  it('with a route role the user lacks, hides that route but keeps the group', () => {
    const registry = createModuleRegistry([reviewModule]);

    const groups = registry.navGroups([REVIEWER]);

    expect(groups[0].items.map((item) => item.route)).toEqual(['/cases']);
    expect(groups[0].items[0].icon).toBe('folder');
  });

  it('with groups, flattens to ui-nav items with a group header row per group', () => {
    const registry = createModuleRegistry([reviewModule, moduleD]);

    const items = registry.navItems([OPERATOR]);

    expect(items.filter((item) => item.groupHeader === true).map((item) => item.key)).toEqual([
      'group-module-d',
      'group-review',
    ]);
    expect(items).toHaveLength(5);
  });

  it('with a duplicate module id, throws', () => {
    const copy: ModuleManifest = { ...moduleD, routes: [{ path: '/other', label: 'Other', roles: [] }] };

    const build = (): unknown => createModuleRegistry([moduleD, copy]);

    expect(build).toThrow('duplicate module id "module-d"');
  });

  it('with the same route path in two modules, throws', () => {
    const clash: ModuleManifest = { ...moduleD, id: 'clash', routes: [{ path: '/cases/', label: 'Mine', roles: [] }] };

    const build = (): unknown => createModuleRegistry([reviewModule, clash]);

    expect(build).toThrow('duplicate route "/cases" in modules "review" and "clash"');
  });

  it('with a module listing no roles, throws', () => {
    const open: ModuleManifest = { ...moduleD, roles: [] };

    const build = (): unknown => createModuleRegistry([open]);

    expect(build).toThrow('module "module-d" lists no roles');
  });

  it('with a relative route path, throws', () => {
    const relative: ModuleManifest = { ...moduleD, routes: [{ path: 'home', label: 'Home', roles: [] }] };

    const build = (): unknown => createModuleRegistry([relative]);

    expect(build).toThrow('must start with "/"');
  });
});

describe('ModuleRegistry.canAccess', () => {
  const registry = createModuleRegistry([reviewModule, moduleD]);

  it('with a page below a route the user may open, allows it', () => {
    const allowed = registry.canAccess('/cases/123', [REVIEWER]);

    expect(allowed).toBe(true);
  });

  it('with the longest matching route needing a role the user lacks, denies it', () => {
    const allowed = registry.canAccess('/cases/settings/team', [REVIEWER]);

    expect(allowed).toBe(false);
  });

  it('with a path sharing only a prefix, not a segment, denies it', () => {
    const allowed = registry.canAccess('/casesx', [REVIEWER]);

    expect(allowed).toBe(false);
  });

  it('with a path no module registers, denies it', () => {
    const allowed = registry.canAccess('/unknown', [OPERATOR]);

    expect(allowed).toBe(false);
  });
});

describe('ModuleRegistry.routeAccess', () => {
  const registry = createModuleRegistry([moduleD]);

  it('while the session loads with no roles yet, returns loading', () => {
    const access = registry.routeAccess('/module-d/home', { loading: true, roles: null });

    expect(access).toBe(RouteAccess.Loading);
  });

  it('while the session refreshes with known roles, keeps the route allowed', () => {
    const access = registry.routeAccess('/module-d/home', { loading: true, roles: [OPERATOR] });

    expect(access).toBe(RouteAccess.Allowed);
  });

  it('with a signed-out session, returns denied', () => {
    const access = registry.routeAccess('/module-d/home', { loading: false, roles: null });

    expect(access).toBe(RouteAccess.Denied);
  });
});

describe('ModuleRegistry.modules', () => {
  it('with a manifest carrying an API client, keeps the client and its type', () => {
    const client = { listItems: (): string[] => [] };
    const registry = createModuleRegistry([{ ...moduleD, apiClient: client }]);

    const kept: typeof client | undefined = registry.modules[0].apiClient;

    expect(kept).toBe(client);
  });
});
