export interface DynCrudColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'currency' | 'image' | 'badge' | 'badges';
  align?: 'left' | 'right' | 'center';
  width?: string;
  cellClass?: string;
  format?: (value: unknown, item: unknown) => string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  maxBadges?: number;
}

export interface DynCrudActions {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  create?: boolean;
}

export interface DynCrudListConfig {
  resourceName: string;
  resourceNamePlural: string;
  description?: string;
  addLabel?: string;
  columns: DynCrudColumn[];
  searchable?: boolean;
  idKey?: string;
  actions?: DynCrudActions;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: (item: unknown) => string;
  pageSizes?: number[];
}

export interface DynCrudFormConfig {
  basePath: string;
  createTitle: string;
  editTitle: string;
  createDescription?: string;
  editDescription?: string;
  columns?: number;
}
