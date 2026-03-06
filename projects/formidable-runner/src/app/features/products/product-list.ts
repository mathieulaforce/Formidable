import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlus, lucideSearch, lucideTrash2 } from '@ng-icons/lucide';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { toast } from 'ngx-sonner';
import type { Product } from './product.models';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideEye, lucidePencil, lucideTrash2 })],
  imports: [
    FormsModule,
    RouterLink,
    HlmTableImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmBadgeImports,
    HlmPaginationImports,
    HlmSpinnerImports,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Products</h1>
          <p class="text-muted-foreground">Manage your product catalog</p>
        </div>
        <a hlmBtn routerLink="new">
          <ng-icon hlm name="lucidePlus" size="sm" class="mr-2" />
          Add Product
        </a>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative max-w-sm flex-1">
          <ng-icon hlm name="lucideSearch" size="sm" class="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            hlmInput
            class="pl-9"
            placeholder="Search products..."
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearch($event)"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <hlm-spinner size="lg" />
        </div>
      } @else {
        <div hlmTableContainer>
          <table hlmTable>
            <thead>
              <tr hlmTrow>
                <th hlmTh class="w-16">Image</th>
                <th hlmTh>Title</th>
                <th hlmTh>Category</th>
                <th hlmTh class="text-right">Price</th>
                <th hlmTh class="text-right">Stock</th>
                <th hlmTh class="text-right">Rating</th>
                <th hlmTh class="w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr hlmTrow>
                  <td hlmTd>
                    <img [src]="product.thumbnail" [alt]="product.title" class="size-10 rounded-md object-cover" />
                  </td>
                  <td hlmTd class="font-medium">{{ product.title }}</td>
                  <td hlmTd>
                    <span hlmBadge variant="secondary">{{ product.category }}</span>
                  </td>
                  <td hlmTd class="text-right">\${{ product.price.toFixed(2) }}</td>
                  <td hlmTd class="text-right">{{ product.stock }}</td>
                  <td hlmTd class="text-right">{{ product.rating.toFixed(1) }}</td>
                  <td hlmTd class="text-right">
                    <div class="flex justify-end gap-1">
                      <a hlmBtn variant="ghost" size="icon" [routerLink]="[product.id]">
                        <ng-icon hlm name="lucideEye" size="sm" />
                      </a>
                      <a hlmBtn variant="ghost" size="icon" [routerLink]="[product.id, 'edit']">
                        <ng-icon hlm name="lucidePencil" size="sm" />
                      </a>
                      <brn-alert-dialog>
                        <button brnAlertDialogTrigger hlmBtn variant="ghost" size="icon">
                          <ng-icon hlm name="lucideTrash2" size="sm" class="text-destructive" />
                        </button>
                        <ng-template hlmAlertDialogPortal>
                          <hlm-alert-dialog-overlay />
                          <hlm-alert-dialog-content>
                            <hlm-alert-dialog-header>
                              <h2 hlmAlertDialogTitle>Delete Product</h2>
                              <p hlmAlertDialogDescription>
                                Are you sure you want to delete "{{ product.title }}"? This action cannot be undone.
                              </p>
                            </hlm-alert-dialog-header>
                            <hlm-alert-dialog-footer>
                              <button hlmAlertDialogCancel>Cancel</button>
                              <button hlmAlertDialogAction (click)="onDelete(product)">Delete</button>
                            </hlm-alert-dialog-footer>
                          </hlm-alert-dialog-content>
                        </ng-template>
                      </brn-alert-dialog>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd [colSpan]="7" class="text-muted-foreground text-center">No products found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <hlm-numbered-pagination
          [(currentPage)]="currentPage"
          [(itemsPerPage)]="itemsPerPage"
          [totalItems]="totalItems()"
          [pageSizes]="[10, 20, 50]"
        />
      }
    </div>
  `,
})
export default class ProductList {
  private readonly service = inject(ProductsService);
  private readonly router = inject(Router);

  protected readonly products = signal<Product[]>([]);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(true);
  protected readonly searchQuery = signal('');

  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = signal(10);

  private readonly skip = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  constructor() {
    effect(() => {
      const skip = this.skip();
      const limit = this.itemsPerPage();
      const query = this.searchQuery();
      this.loadProducts(query, limit, skip);
    });
  }

  private loadProducts(query: string, limit: number, skip: number): void {
    this.loading.set(true);
    const request = query ? this.service.search(query, limit, skip) : this.service.getAll(limit, skip);

    request.subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Failed to load products');
      },
    });
  }

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onDelete(product: Product): void {
    this.service.delete(product.id).subscribe({
      next: () => {
        this.products.update((items) => items.filter((p) => p.id !== product.id));
        toast.success(`"${product.title}" deleted successfully`);
      },
      error: () => toast.error('Failed to delete product'),
    });
  }
}
