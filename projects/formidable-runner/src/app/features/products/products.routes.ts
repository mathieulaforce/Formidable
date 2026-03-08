import { dynCrudRoutes } from 'dyn-crud';

export const productsRoutes = dynCrudRoutes({
  listComponent: () => import('./product-list'),
  formComponent: () => import('./product-form'),
  detailComponent: () => import('./product-detail'),
});
