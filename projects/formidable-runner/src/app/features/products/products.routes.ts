import type { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  { path: '', loadComponent: () => import('./product-list') },
  { path: 'new', loadComponent: () => import('./product-form') },
  {
    path: ':id',
    children: [
      { path: '', loadComponent: () => import('./product-detail') },
      { path: 'edit', loadComponent: () => import('./product-form') },
    ],
  },
];
