import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import { lucideStar } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { DynCrudDetailComponent } from 'dyn-crud';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideStar })],
  imports: [CurrencyPipe, DynCrudDetailComponent, HlmCardImports, HlmIconImports, HlmBadgeImports, HlmSeparatorImports],
  template: `
    <dyn-crud-detail
      basePath="/products"
      [title]="product()?.title ?? ''"
      [subtitle]="productSubtitle()"
      [loading]="productResource.isLoading()"
    >
      @if (product(); as p) {
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
                <h3 hlmCardTitle>Shipping &amp; Warranty</h3>
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
      }
    </dyn-crud-detail>
  `,
})
export default class ProductDetail {
  private readonly service = inject(ProductsService);

  readonly id = input.required<string>();

  protected readonly productResource = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) => this.service.getById(id),
  });

  protected readonly product = computed(() => this.productResource.value());

  protected readonly productSubtitle = computed(() => {
    const p = this.product();
    return p ? `${p.brand} \u00b7 ${p.category}` : '';
  });
}
