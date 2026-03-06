import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePencil, lucideStar } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import type { Product } from './product.models';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowLeft, lucidePencil, lucideStar })],
  imports: [
    CurrencyPipe,
    RouterLink,
    HlmCardImports,
    HlmButtonImports,
    HlmIconImports,
    HlmBadgeImports,
    HlmSeparatorImports,
    HlmSpinnerImports,
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12">
        <hlm-spinner size="lg" />
      </div>
    } @else if (product(); as p) {
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <a hlmBtn variant="outline" size="icon" routerLink="/products">
            <ng-icon hlm name="lucideArrowLeft" size="sm" />
          </a>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{{ p.title }}</h1>
            <p class="text-muted-foreground">{{ p.brand }} &middot; {{ p.category }}</p>
          </div>
          <a hlmBtn [routerLink]="['edit']">
            <ng-icon hlm name="lucidePencil" size="sm" class="mr-2" />
            Edit
          </a>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <section hlmCard>
            <div hlmCardContent class="p-0">
              @if (p.images.length) {
                <img [src]="p.images[0]" [alt]="p.title" class="aspect-square w-full rounded-t-lg object-cover" />
              }
            </div>
          </section>

          <div class="space-y-4">
            <section hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Details</h3>
              </div>
              <div hlmCardContent class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Price</span>
                  <span class="font-semibold">{{ p.price | currency }}</span>
                </div>
                @if (p.discountPercentage) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Discount</span>
                    <span hlmBadge variant="destructive">-{{ p.discountPercentage }}%</span>
                  </div>
                }
                <hlm-separator />
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Stock</span>
                  <span>{{ p.stock }} units</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Availability</span>
                  <span hlmBadge [variant]="p.availabilityStatus === 'In Stock' ? 'default' : 'secondary'">
                    {{ p.availabilityStatus }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Rating</span>
                  <span class="flex items-center gap-1">
                    <ng-icon hlm name="lucideStar" size="sm" class="text-yellow-500" />
                    {{ p.rating.toFixed(1) }}
                  </span>
                </div>
                <hlm-separator />
                <div class="flex justify-between">
                  <span class="text-muted-foreground">SKU</span>
                  <span>{{ p.sku }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Weight</span>
                  <span>{{ p.weight }}g</span>
                </div>
              </div>
            </section>

            <section hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Shipping & Warranty</h3>
              </div>
              <div hlmCardContent class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Shipping</span>
                  <span>{{ p.shippingInformation }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Warranty</span>
                  <span>{{ p.warrantyInformation }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Return Policy</span>
                  <span>{{ p.returnPolicy }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Description</h3>
          </div>
          <div hlmCardContent>
            <p class="text-muted-foreground leading-relaxed">{{ p.description }}</p>
          </div>
        </section>

        @if (p.reviews.length) {
          <section hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Reviews ({{ p.reviews.length }})</h3>
            </div>
            <div hlmCardContent class="space-y-4">
              @for (review of p.reviews; track review.reviewerEmail) {
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ review.reviewerName }}</span>
                    <span class="flex items-center gap-1 text-sm">
                      <ng-icon hlm name="lucideStar" size="xs" class="text-yellow-500" />
                      {{ review.rating }}
                    </span>
                  </div>
                  <p class="text-muted-foreground text-sm">{{ review.comment }}</p>
                </div>
                @if (!$last) {
                  <hlm-separator />
                }
              }
            </div>
          </section>
        }

        @if (p.tags.length) {
          <div class="flex flex-wrap gap-2">
            @for (tag of p.tags; track tag) {
              <span hlmBadge variant="outline">{{ tag }}</span>
            }
          </div>
        }
      </div>
    }
  `,
})
export default class ProductDetail {
  private readonly service = inject(ProductsService);

  readonly id = input.required<string>();
  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      const id = Number(this.id());
      if (id) this.loadProduct(id);
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
