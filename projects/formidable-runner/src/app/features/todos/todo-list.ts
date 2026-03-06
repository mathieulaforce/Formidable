import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogClose } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth/auth.service';
import type { Todo } from './todo.models';
import { TodosService } from './todos.service';

@Component({
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideCheck, lucideX })],
  imports: [
    FormsModule,
    HlmTableImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmCardImports,
    HlmPaginationImports,
    HlmSpinnerImports,
    HlmCheckboxImports,
    BrnAlertDialogImports,
    BrnDialogClose,
    HlmAlertDialogImports,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Todos</h1>
          <p class="text-muted-foreground">Manage your tasks</p>
        </div>
      </div>

      <section hlmCard class="max-w-2xl">
        <div hlmCardContent class="pt-6">
          <form (ngSubmit)="onAdd()" class="flex gap-2">
            <input
              hlmInput
              class="flex-1"
              placeholder="Add a new todo..."
              [(ngModel)]="newTodoText"
              name="todo"
            />
            <button hlmBtn type="submit" [disabled]="!newTodoText().trim()">
              <ng-icon hlm name="lucidePlus" size="sm" class="mr-2" />
              Add
            </button>
          </form>
        </div>
      </section>

      @if (todosResource.isLoading()) {
        <div class="flex justify-center py-12">
          <hlm-spinner size="lg" />
        </div>
      } @else {
        <div hlmTableContainer>
          <table hlmTable>
            <thead>
              <tr hlmTrow>
                <th hlmTh class="w-16">Done</th>
                <th hlmTh>Task</th>
                <th hlmTh class="w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (todo of todos(); track todo.id) {
                <tr hlmTrow>
                  <td hlmTd>
                    <hlm-checkbox
                      [checked]="todo.completed"
                      (checkedChange)="onToggle(todo)"
                    />
                  </td>
                  <td hlmTd [class]="todo.completed ? 'text-muted-foreground line-through' : ''">
                    {{ todo.todo }}
                  </td>
                  <td hlmTd class="text-right">
                    <brn-alert-dialog>
                      <button brnAlertDialogTrigger hlmBtn variant="ghost" size="icon">
                        <ng-icon hlm name="lucideTrash2" size="sm" class="text-destructive" />
                      </button>
                      <ng-template hlmAlertDialogPortal>
                        <hlm-alert-dialog-overlay />
                        <hlm-alert-dialog-content>
                          <hlm-alert-dialog-header>
                            <h2 hlmAlertDialogTitle>Delete Todo</h2>
                            <p hlmAlertDialogDescription>
                              Are you sure you want to delete this todo? This action cannot be undone.
                            </p>
                          </hlm-alert-dialog-header>
                          <hlm-alert-dialog-footer>
                            <button hlmAlertDialogCancel brnDialogClose>Cancel</button>
                            <button hlmAlertDialogAction brnDialogClose (click)="onDelete(todo)">Delete</button>
                          </hlm-alert-dialog-footer>
                        </hlm-alert-dialog-content>
                      </ng-template>
                    </brn-alert-dialog>
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd [colSpan]="3" class="text-muted-foreground text-center">No todos found.</td>
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
export default class TodoList {
  private readonly service = inject(TodosService);
  private readonly auth = inject(AuthService);

  protected readonly newTodoText = signal('');
  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = signal(10);

  private readonly skip = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  protected readonly todosResource = rxResource({
    params: () => ({ limit: this.itemsPerPage(), skip: this.skip() }),
    stream: ({ params }) => this.service.getAll(params.limit, params.skip),
  });

  protected readonly todos = computed(() => this.todosResource.value()?.todos ?? []);
  protected readonly totalItems = computed(() => this.todosResource.value()?.total ?? 0);

  constructor() {
    effect(() => {
      if (this.todosResource.error()) {
        toast.error('Failed to load todos');
      }
    });
  }

  protected onAdd(): void {
    const text = this.newTodoText().trim();
    if (!text) return;

    const userId = this.auth.user()?.id ?? 1;
    this.service.create({ todo: text, completed: false, userId }).subscribe({
      next: (todo) => {
        const current = this.todosResource.value();
        if (current) {
          this.todosResource.set({ ...current, todos: [todo, ...current.todos], total: current.total + 1 });
        }
        this.newTodoText.set('');
        toast.success('Todo added');
      },
      error: () => toast.error('Failed to add todo'),
    });
  }

  protected onToggle(todo: Todo): void {
    const updated = !todo.completed;
    this.service.update(todo.id, { completed: updated }).subscribe({
      next: () => {
        const current = this.todosResource.value();
        if (current) {
          this.todosResource.set({
            ...current,
            todos: current.todos.map((t) => (t.id === todo.id ? { ...t, completed: updated } : t)),
          });
        }
      },
      error: () => toast.error('Failed to update todo'),
    });
  }

  protected onDelete(todo: Todo): void {
    this.service.delete(todo.id).subscribe({
      next: () => {
        const current = this.todosResource.value();
        if (current) {
          this.todosResource.set({
            ...current,
            todos: current.todos.filter((t) => t.id !== todo.id),
            total: current.total - 1,
          });
        }
        toast.success('Todo deleted');
      },
      error: () => toast.error('Failed to delete todo'),
    });
  }
}
