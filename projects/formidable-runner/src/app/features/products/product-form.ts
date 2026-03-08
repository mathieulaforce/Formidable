import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DynCrudFormComponent, type DynCrudFormConfig } from 'dyn-crud';
import type { DynFieldConfig } from 'dyn-form';
import { toast } from 'ngx-sonner';
import type { ProductFormData } from './product.models';
import { ProductsService } from './products.service';

const FORM_CONFIG: DynCrudFormConfig = {
  basePath: '/products',
  createTitle: 'New Product',
  editTitle: 'Edit Product',
  createDescription: 'Add a new product to the catalog',
  editDescription: 'Update product details',
  columns: 2,
};

const FORM_FIELDS: DynFieldConfig[] = [
  { key: 'title', type: 'text', label: 'Title', placeholder: 'Product title', colSpan: 2, validators: [{ validator: 'required' }] },
  { key: 'description', type: 'textarea', label: 'Description', placeholder: 'Product description', rows: 4, colSpan: 2, validators: [{ validator: 'required' }] },
  { key: 'price', type: 'number', label: 'Price', placeholder: '0.00', colSpan: 1, validators: [{ validator: 'required' }, { validator: 'min', value: 0 }] },
  { key: 'stock', type: 'number', label: 'Stock', placeholder: '0', colSpan: 1, validators: [{ validator: 'required' }, { validator: 'min', value: 0 }] },
  { key: 'category', type: 'text', label: 'Category', placeholder: 'e.g. beauty', colSpan: 1, validators: [{ validator: 'required' }] },
  { key: 'brand', type: 'text', label: 'Brand', placeholder: 'Brand name', colSpan: 1, validators: [{ validator: 'required' }] },
];

@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynCrudFormComponent],
  template: `
    <dyn-crud-form
      [config]="formConfig"
      [fields]="formFields"
      [value]="formValue()"
      [saving]="saving()"
      [id]="id()"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export default class ProductForm {
  private readonly service = inject(ProductsService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly saving = signal(false);
  protected readonly formConfig = FORM_CONFIG;
  protected readonly formFields = FORM_FIELDS;

  private readonly productResource = rxResource({
    params: () => {
      const id = this.id();
      return id ? Number(id) : undefined;
    },
    stream: ({ params: id }) => this.service.getById(id),
  });

  protected readonly formValue = computed(() => {
    const product = this.productResource.value();
    if (!product) return undefined;
    return {
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      brand: product.brand,
    };
  });

  constructor() {
    effect(() => {
      if (this.productResource.error()) {
        toast.error('Failed to load product');
      }
    });
  }

  protected onSubmit(data: Record<string, unknown>): void {
    this.saving.set(true);
    const id = this.id();
    const request = id
      ? this.service.update(Number(id), data as unknown as ProductFormData)
      : this.service.create(data as unknown as ProductFormData);

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
