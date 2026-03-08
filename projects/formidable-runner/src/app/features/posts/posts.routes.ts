import { dynCrudRoutes } from 'dyn-crud';

export const postsRoutes = dynCrudRoutes({
  listComponent: () => import('./post-list'),
  formComponent: () => import('./post-form'),
  detailComponent: () => import('./post-detail'),
});
