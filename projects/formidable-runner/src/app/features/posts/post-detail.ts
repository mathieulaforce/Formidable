import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import { lucideThumbsDown, lucideThumbsUp } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { DynCrudDetailComponent } from 'dyn-crud';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-post-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideThumbsUp, lucideThumbsDown })],
  imports: [DynCrudDetailComponent, HlmCardImports, HlmIconImports, HlmBadgeImports, HlmSeparatorImports],
  template: `
    <dyn-crud-detail
      basePath="/posts"
      [title]="post()?.title ?? ''"
      [loading]="postResource.isLoading()"
    >
      @if (post(); as p) {
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
          <hlm-separator />
          <span class="text-muted-foreground text-sm">{{ p.views }} views</span>
        </div>

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
export default class PostDetail {
  private readonly service = inject(PostsService);

  readonly id = input.required<string>();

  protected readonly postResource = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) => this.service.getById(id),
  });

  protected readonly post = computed(() => this.postResource.value());
}
