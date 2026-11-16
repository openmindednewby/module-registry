export interface ModuleNavItem {
  key: string;
  label: string;
  route: string;
  groupHeader?: boolean;
  icon?: string;
}

export interface ModuleNavGroup {
  key: string;
  moduleId: string;
  label: string;
  order: number;
  items: ModuleNavItem[];
}

export interface ModuleSession {
  loading: boolean;
  roles: readonly string[] | null;
}
