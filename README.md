# @dloizides/module-registry

Each module of a console shell declares one manifest; the shell reads the registry and never changes when a module is added.

```ts
import { createModuleRegistry } from '@dloizides/module-registry';

const registry = createModuleRegistry([
  { id: 'reports', navGroup: { label: 'Reports', order: 30 }, roles: ['analyst'],
    routes: [{ path: '/reports', label: 'Reports', roles: [], icon: 'chart' }] },
]);

registry.navGroups(user.roles);
registry.navItems(user.roles);
registry.canAccess('/reports/42', user.roles);
registry.routeAccess('/reports', { loading, roles });
```

- `navGroups`: the groups the user may see, sorted by `order`.
- `navItems`: flat `@dloizides/ui-nav` NavItem rows with a `groupHeader` row per group (`icon` is a name the app maps to `renderIcon`).
- `canAccess`: a path matches its longest registered route on whole segments; an unregistered path is denied.
- `routeAccess`: `RouteAccess.Loading` while the session loads with no roles, else Allowed or Denied.
- A route with an empty `roles` list inherits the module's roles; a user sees a module only with one of its `roles`.
