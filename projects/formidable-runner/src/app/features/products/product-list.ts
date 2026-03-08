import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DynCrudListComponent, type DynCrudListConfig } from 'dyn-crud';
import { toast } from 'ngx-sonner';
import type { Product } from './product.models';
import { ProductsService } from './products.service';

const LIST_CONFIG: DynCrudListConfig = {
  resourceName: 'Product',
  resourceNamePlural: 'Products',
  description: 'Manage your product catalog',
  addLabel: 'Add Product',
  searchable: true,
  columns: [
    { key: 'thumbnail', header: 'Image', type: 'image', width: 'w-16' },
    { key: 'title', header: 'Title', cellClass: 'font-medium' },
    { key: 'category', header: 'Category', type: 'badge', badgeVariant: 'secondary' },
    { key: 'price', header: 'Price', type: 'currency', align: 'right' },
    { key: 'stock', header: 'Stock', type: 'number', align: 'right' },
    { key: 'rating', header: 'Rating', type: 'number', align: 'right', format: (v) => (v as number).toFixed(1) },
  ],
  deleteConfirmTitle: 'Delete Product',
  deleteConfirmDescription: (item) =>
    `Are you sure you want to delete "${(item as Product).title}"? This action cannot be undone.`,
};

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynCrudListComponent],
  template: `
    <dyn-crud-list
      [config]="config"
      [items]="products()"
      [totalItems]="totalItems()"
      [loading]="productsResource.isLoading()"
      [(currentPage)]="currentPage"
      [(itemsPerPage)]="itemsPerPage"
      (searchChange)="onSearch($event)"
      (itemDelete)="onDelete($event)"
    />
  `,
})
export default class ProductList {
  private readonly service = inject(ProductsService);

  protected readonly config = LIST_CONFIG;
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = signal(10);

  private readonly skip = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  protected readonly productsResource = rxResource({
    params: () => ({ query: this.searchQuery(), limit: this.itemsPerPage(), skip: this.skip() }),
    stream: ({ params: { query, limit, skip } }) =>
      query ? this.service.search(query, limit, skip) : this.service.getAll(limit, skip),
  });

  protected readonly products = computed(() => this.productsResource.value()?.products ?? []);
  protected readonly totalItems = computed(() => this.productsResource.value()?.total ?? 0);

  constructor() {
    effect(() => {
      if (this.productsResource.error()) {
        toast.error('Failed to load products');
      }
    });
  }

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onDelete(item: unknown): void {
    const product = item as Product;
    this.service.delete(product.id).subscribe({
      next: () => {
        const current = this.productsResource.value();
        if (current) {
          this.productsResource.set({ ...current, products: current.products.filter((p) => p.id !== product.id) });
        }
        toast.success(`"${product.title}" deleted successfully`);
      },
      error: () => toast.error('Failed to delete product'),
    });
  }
}
