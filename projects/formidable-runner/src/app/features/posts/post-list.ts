import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DynCrudListComponent, type DynCrudListConfig } from 'dyn-crud';
import { toast } from 'ngx-sonner';
import type { Post } from './post.models';
import { PostsService } from './posts.service';

const LIST_CONFIG: DynCrudListConfig = {
  resourceName: 'Post',
  resourceNamePlural: 'Posts',
  description: 'Manage blog posts',
  addLabel: 'New Post',
  searchable: true,
  columns: [
    { key: 'title', header: 'Title', cellClass: 'max-w-md font-medium' },
    { key: 'tags', header: 'Tags', type: 'badges', badgeVariant: 'secondary', maxBadges: 2 },
    { key: 'reactions.likes', header: 'Likes', type: 'number', align: 'right' },
    { key: 'reactions.dislikes', header: 'Dislikes', type: 'number', align: 'right' },
    { key: 'views', header: 'Views', type: 'number', align: 'right' },
  ],
  deleteConfirmTitle: 'Delete Post',
  deleteConfirmDescription: () => 'Are you sure you want to delete this post? This action cannot be undone.',
};

@Component({
  selector: 'app-post-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynCrudListComponent],
  template: `
    <dyn-crud-list
      [config]="config"
      [items]="posts()"
      [totalItems]="totalItems()"
      [loading]="postsResource.isLoading()"
      [(currentPage)]="currentPage"
      [(itemsPerPage)]="itemsPerPage"
      (searchChange)="onSearch($event)"
      (itemDelete)="onDelete($event)"
    />
  `,
})
export default class PostList {
  private readonly service = inject(PostsService);

  protected readonly config = LIST_CONFIG;
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = signal(10);

  private readonly skip = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  protected readonly postsResource = rxResource({
    params: () => ({ query: this.searchQuery(), limit: this.itemsPerPage(), skip: this.skip() }),
    stream: ({ params: { query, limit, skip } }) =>
      query ? this.service.search(query, limit, skip) : this.service.getAll(limit, skip),
  });

  protected readonly posts = computed(() => this.postsResource.value()?.posts ?? []);
  protected readonly totalItems = computed(() => this.postsResource.value()?.total ?? 0);

  constructor() {
    effect(() => {
      if (this.postsResource.error()) {
        toast.error('Failed to load posts');
      }
    });
  }

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onDelete(item: unknown): void {
    const post = item as Post;
    this.service.delete(post.id).subscribe({
      next: () => {
        const current = this.postsResource.value();
        if (current) {
          this.postsResource.set({ ...current, posts: current.posts.filter((p) => p.id !== post.id) });
        }
        toast.success('Post deleted successfully');
      },
      error: () => toast.error('Failed to delete post'),
    });
  }
}
