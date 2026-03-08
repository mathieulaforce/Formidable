import type { Route, Routes } from '@angular/router';

type LoadComponentFn = NonNullable<Route['loadComponent']>;

export interface DynCrudRouteConfig {
  listComponent: LoadComponentFn;
  formComponent: LoadComponentFn;
  detailComponent?: LoadComponentFn;
}

export function dynCrudRoutes(config: DynCrudRouteConfig): Routes {
  const routes: Routes = [
    { path: '', loadComponent: config.listComponent },
    { path: 'new', loadComponent: config.formComponent },
  ];

  if (config.detailComponent) {
    routes.push({
      path: ':id',
      children: [
        { path: '', loadComponent: config.detailComponent },
        { path: 'edit', loadComponent: config.formComponent },
      ],
    });
  } else {
    routes.push({ path: ':id/edit', loadComponent: config.formComponent });
  }

  return routes;
}
