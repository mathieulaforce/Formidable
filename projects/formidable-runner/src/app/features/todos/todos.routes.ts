import type { Routes } from '@angular/router';

export const todosRoutes: Routes = [{ path: '', loadComponent: () => import('./todo-list') }];
