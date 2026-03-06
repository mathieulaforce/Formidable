import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
import { AuthService } from '../../core/auth/auth.service';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-post-form',
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
        <a hlmBtn variant="outline" size="icon" routerLink="/posts">
          <ng-icon hlm name="lucideArrowLeft" size="sm" />
        </a>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ isEdit() ? 'Edit Post' : 'New Post' }}</h1>
          <p class="text-muted-foreground">{{ isEdit() ? 'Update post content' : 'Create a new blog post' }}</p>
        </div>
      </div>

      <section hlmCard class="max-w-2xl">
        <div hlmCardContent class="pt-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="flex flex-col gap-2">
              <label hlmLabel for="title">Title</label>
              <input hlmInput id="title" formControlName="title" placeholder="Post title" />
            </div>
            <div class="flex flex-col gap-2">
              <label hlmLabel for="body">Content</label>
              <textarea hlmTextarea id="body" formControlName="body" placeholder="Write your post..." rows="8"></textarea>
            </div>
            <div class="flex flex-col gap-2">
              <label hlmLabel for="tags">Tags (comma-separated)</label>
              <input hlmInput id="tags" formControlName="tags" placeholder="e.g. history, science, fiction" />
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <a hlmBtn variant="outline" routerLink="/posts">Cancel</a>
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
export default class PostForm {
  private readonly service = inject(PostsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly id = input<string>();
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
    tags: [''],
  });

  private readonly postResource = rxResource({
    params: () => {
      const id = this.id();
      return id ? Number(id) : undefined;
    },
    stream: ({ params: id }) => this.service.getById(id),
  });

  constructor() {
    effect(() => {
      const post = this.postResource.value();
      if (post) {
        this.form.patchValue({
          title: post.title,
          body: post.body,
          tags: post.tags.join(', '),
        });
      }
    });

    effect(() => {
      if (this.postResource.error()) {
        toast.error('Failed to load post');
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { title, body, tags } = this.form.getRawValue();
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const userId = this.auth.user()?.id ?? 1;
    const id = this.id();

    const request = id
      ? this.service.update(Number(id), { title, body, tags: parsedTags })
      : this.service.create({ title, body, tags: parsedTags, userId });

    request.subscribe({
      next: () => {
        toast.success(id ? 'Post updated' : 'Post created');
        this.router.navigate(['/posts']);
      },
      error: () => {
        this.saving.set(false);
        toast.error('Failed to save post');
      },
    });
  }
}
