import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DynCrudFormComponent, type DynCrudFormConfig } from 'dyn-crud';
import type { DynFieldConfig } from 'dyn-form';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth/auth.service';
import { PostsService } from './posts.service';

const FORM_CONFIG: DynCrudFormConfig = {
  basePath: '/posts',
  createTitle: 'New Post',
  editTitle: 'Edit Post',
  createDescription: 'Create a new blog post',
  editDescription: 'Update post content',
};

const FORM_FIELDS: DynFieldConfig[] = [
  { key: 'title', type: 'text', label: 'Title', placeholder: 'Post title', validators: [{ validator: 'required' }] },
  { key: 'body', type: 'textarea', label: 'Content', placeholder: 'Write your post...', rows: 8, validators: [{ validator: 'required' }] },
  { key: 'tags', type: 'text', label: 'Tags (comma-separated)', placeholder: 'e.g. history, science, fiction' },
];

@Component({
  selector: 'app-post-form',
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
export default class PostForm {
  private readonly service = inject(PostsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly saving = signal(false);
  protected readonly formConfig = FORM_CONFIG;
  protected readonly formFields = FORM_FIELDS;

  private readonly postResource = rxResource({
    params: () => {
      const id = this.id();
      return id ? Number(id) : undefined;
    },
    stream: ({ params: id }) => this.service.getById(id),
  });

  protected readonly formValue = computed(() => {
    const post = this.postResource.value();
    if (!post) return undefined;
    return {
      title: post.title,
      body: post.body,
      tags: post.tags.join(', '),
    };
  });

  constructor() {
    effect(() => {
      if (this.postResource.error()) {
        toast.error('Failed to load post');
      }
    });
  }

  protected onSubmit(data: Record<string, unknown>): void {
    this.saving.set(true);
    const title = data['title'] as string;
    const body = data['body'] as string;
    const tags = (data['tags'] as string)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const userId = this.auth.user()?.id ?? 1;
    const id = this.id();

    const request = id
      ? this.service.update(Number(id), { title, body, tags })
      : this.service.create({ title, body, tags, userId });

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
