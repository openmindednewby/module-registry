# Changelog

## 0.1.1

- `createModuleRegistry(manifests)`: typed module manifests turned into role-filtered nav groups, ui-nav items with group headers, `canAccess(path, roles)` and `routeAccess(path, session)`.
- Duplicate module id or route path, an empty id, a module with no roles or a relative path throws at registration.
