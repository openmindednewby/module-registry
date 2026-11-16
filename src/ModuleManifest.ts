export interface ModuleNavGroupSpec {
  label: string;
  order: number;
}

export interface ModuleRoute {
  path: string;
  label: string;
  roles: readonly string[];
  icon?: string;
}

export interface ModuleManifest<TApiClient = unknown> {
  id: string;
  navGroup: ModuleNavGroupSpec;
  routes: readonly ModuleRoute[];
  roles: readonly string[];
  apiClient?: TApiClient;
}
