import type { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./login') },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
