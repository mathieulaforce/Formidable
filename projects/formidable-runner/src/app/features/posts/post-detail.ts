import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePencil, lucideThumbsDown, lucideThumbsUp } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-post-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowLeft, lucidePencil, lucideThumbsUp, lucideThumbsDown })],
  imports: [RouterLink, HlmCardImports, HlmButtonImports, HlmIconImports, HlmBadgeImports, HlmSeparatorImports, HlmSpinnerImports],
  template: `
    @if (postResource.isLoading()) {
      <div class="flex justify-center py-12">
        <hlm-spinner size="lg" />
      </div>
    } @else if (postResource.value(); as p) {
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <a hlmBtn variant="outline" size="icon" routerLink="/posts">
            <ng-icon hlm name="lucideArrowLeft" size="sm" />
          </a>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{{ p.title }}</h1>
          </div>
          <a hlmBtn [routerLink]="['edit']">
            <ng-icon hlm name="lucidePencil" size="sm" class="mr-2" />
            Edit
          </a>
        </div>

        <section hlmCard class="max-w-3xl">
          <div hlmCardContent class="pt-6">
            <p class="leading-7 whitespace-pre-line">{{ p.body }}</p>
          </div>
        </section>

        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-1">
            <ng-icon hlm name="lucideThumbsUp" size="sm" class="text-green-600" />
            <span class="text-sm font-medium">{{ p.reactions.likes }}</span>
          </div>
          <div class="flex items-center gap-1">
            <ng-icon hlm name="lucideThumbsDown" size="sm" class="text-red-600" />
            <span class="text-sm font-medium">{{ p.reactions.dislikes }}</span>
          </div>
          <hlm-separator orientation="vertical" class="h-4" />
          <span class="text-muted-foreground text-sm">{{ p.views }} views</span>
        </div>

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
export default class PostDetail {
  private readonly service = inject(PostsService);

  readonly id = input.required<string>();

  protected readonly postResource = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) => this.service.getById(id),
  });
}
