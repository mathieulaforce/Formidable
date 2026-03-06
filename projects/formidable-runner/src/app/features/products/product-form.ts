import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { toast } from 'ngx-sonner';
import type { Product } from './product.models';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowLeft })],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmCardImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTextareaImports,
    HlmSpinnerImports,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a hlmBtn variant="outline" size="icon" routerLink="/products">
          <ng-icon hlm name="lucideArrowLeft" size="sm" />
        </a>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ isEdit() ? 'Edit Product' : 'New Product' }}</h1>
          <p class="text-muted-foreground">{{ isEdit() ? 'Update product details' : 'Add a new product to the catalog' }}</p>
        </div>
      </div>

      <section hlmCard class="max-w-2xl">
        <div hlmCardContent class="pt-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="flex flex-col gap-2">
              <label hlmLabel for="title">Title</label>
              <input hlmInput id="title" formControlName="title" placeholder="Product title" />
            </div>
            <div class="flex flex-col gap-2">
              <label hlmLabel for="description">Description</label>
              <textarea hlmTextarea id="description" formControlName="description" placeholder="Product description" rows="4"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label hlmLabel for="price">Price</label>
                <input hlmInput id="price" type="number" formControlName="price" placeholder="0.00" />
              </div>
              <div class="flex flex-col gap-2">
                <label hlmLabel for="stock">Stock</label>
                <input hlmInput id="stock" type="number" formControlName="stock" placeholder="0" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label hlmLabel for="category">Category</label>
                <input hlmInput id="category" formControlName="category" placeholder="e.g. beauty" />
              </div>
              <div class="flex flex-col gap-2">
                <label hlmLabel for="brand">Brand</label>
                <input hlmInput id="brand" formControlName="brand" placeholder="Brand name" />
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <a hlmBtn variant="outline" routerLink="/products">Cancel</a>
              <button hlmBtn type="submit" [disabled]="saving() || form.invalid">
                @if (saving()) {
                  <hlm-spinner size="sm" class="mr-2" />
                }
                {{ isEdit() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `,
})
export default class ProductForm {
  private readonly service = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly id = input<string>();

  protected readonly saving = signal(false);
  protected readonly isEdit = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    brand: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.isEdit.set(true);
        this.loadProduct(Number(id));
      }
    });
  }

  private loadProduct(id: number): void {
    this.service.getById(id).subscribe({
      next: (product: Product) => {
        this.form.patchValue({
          title: product.title,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          brand: product.brand,
        });
      },
      error: () => toast.error('Failed to load product'),
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.getRawValue();
    const id = this.id();

    const request = id ? this.service.update(Number(id), data) : this.service.create(data);

    request.subscribe({
      next: () => {
        toast.success(id ? 'Product updated' : 'Product created');
        this.router.navigate(['/products']);
      },
      error: () => {
        this.saving.set(false);
        toast.error('Failed to save product');
      },
    });
  }
}
