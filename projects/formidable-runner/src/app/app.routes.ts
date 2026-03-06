import type { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Shell } from './shell/shell';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard') },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then((m) => m.productsRoutes),
      },
      {
        path: 'posts',
        loadChildren: () => import('./features/posts/posts.routes').then((m) => m.postsRoutes),
      },
      {
        path: 'todos',
        loadChildren: () => import('./features/todos/todos.routes').then((m) => m.todosRoutes),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
