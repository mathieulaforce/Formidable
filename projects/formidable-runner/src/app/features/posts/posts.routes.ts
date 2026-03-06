import type { Routes } from '@angular/router';

export const postsRoutes: Routes = [
  { path: '', loadComponent: () => import('./post-list') },
  { path: 'new', loadComponent: () => import('./post-form') },
  {
    path: ':id',
    children: [
      { path: '', loadComponent: () => import('./post-detail') },
      { path: 'edit', loadComponent: () => import('./post-form') },
    ],
  },
];
