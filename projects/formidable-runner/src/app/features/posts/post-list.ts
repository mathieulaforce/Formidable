import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlus, lucideSearch, lucideThumbsDown, lucideThumbsUp, lucideTrash2 } from '@ng-icons/lucide';
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
import type { Post } from './post.models';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-post-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideEye, lucidePencil, lucideTrash2, lucideThumbsUp, lucideThumbsDown })],
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
          <h1 class="text-3xl font-bold tracking-tight">Posts</h1>
          <p class="text-muted-foreground">Manage blog posts</p>
        </div>
        <a hlmBtn routerLink="new">
          <ng-icon hlm name="lucidePlus" size="sm" class="mr-2" />
          New Post
        </a>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative max-w-sm flex-1">
          <ng-icon hlm name="lucideSearch" size="sm" class="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            hlmInput
            class="pl-9"
            placeholder="Search posts..."
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
                <th hlmTh>Title</th>
                <th hlmTh>Tags</th>
                <th hlmTh class="text-right">
                  <ng-icon hlm name="lucideThumbsUp" size="sm" />
                </th>
                <th hlmTh class="text-right">
                  <ng-icon hlm name="lucideThumbsDown" size="sm" />
                </th>
                <th hlmTh class="text-right">Views</th>
                <th hlmTh class="w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (post of posts(); track post.id) {
                <tr hlmTrow>
                  <td hlmTd class="max-w-md font-medium">
                    <span class="line-clamp-1">{{ post.title }}</span>
                  </td>
                  <td hlmTd>
                    <div class="flex gap-1">
                      @for (tag of post.tags.slice(0, 2); track tag) {
                        <span hlmBadge variant="secondary" class="text-xs">{{ tag }}</span>
                      }
                      @if (post.tags.length > 2) {
                        <span hlmBadge variant="outline" class="text-xs">+{{ post.tags.length - 2 }}</span>
                      }
                    </div>
                  </td>
                  <td hlmTd class="text-right">{{ post.reactions.likes }}</td>
                  <td hlmTd class="text-right">{{ post.reactions.dislikes }}</td>
                  <td hlmTd class="text-right">{{ post.views }}</td>
                  <td hlmTd class="text-right">
                    <div class="flex justify-end gap-1">
                      <a hlmBtn variant="ghost" size="icon" [routerLink]="[post.id]">
                        <ng-icon hlm name="lucideEye" size="sm" />
                      </a>
                      <a hlmBtn variant="ghost" size="icon" [routerLink]="[post.id, 'edit']">
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
                              <h2 hlmAlertDialogTitle>Delete Post</h2>
                              <p hlmAlertDialogDescription>
                                Are you sure you want to delete this post? This action cannot be undone.
                              </p>
                            </hlm-alert-dialog-header>
                            <hlm-alert-dialog-footer>
                              <button hlmAlertDialogCancel>Cancel</button>
                              <button hlmAlertDialogAction (click)="onDelete(post)">Delete</button>
                            </hlm-alert-dialog-footer>
                          </hlm-alert-dialog-content>
                        </ng-template>
                      </brn-alert-dialog>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd [colSpan]="6" class="text-muted-foreground text-center">No posts found.</td>
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
export default class PostList {
  private readonly service = inject(PostsService);

  protected readonly posts = signal<Post[]>([]);
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
      this.loadPosts(query, limit, skip);
    });
  }

  private loadPosts(query: string, limit: number, skip: number): void {
    this.loading.set(true);
    const request = query ? this.service.search(query, limit, skip) : this.service.getAll(limit, skip);

    request.subscribe({
      next: (response) => {
        this.posts.set(response.posts);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Failed to load posts');
      },
    });
  }

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onDelete(post: Post): void {
    this.service.delete(post.id).subscribe({
      next: () => {
        this.posts.update((items) => items.filter((p) => p.id !== post.id));
        toast.success('Post deleted successfully');
      },
      error: () => toast.error('Failed to delete post'),
    });
  }
}
