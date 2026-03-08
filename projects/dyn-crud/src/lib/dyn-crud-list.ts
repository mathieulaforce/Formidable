import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlus, lucideSearch, lucideTrash2 } from '@ng-icons/lucide';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogClose } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import type { DynCrudColumn, DynCrudListConfig } from './models';

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

@Component({
  selector: 'dyn-crud-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideEye, lucidePencil, lucideTrash2 })],
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
    BrnDialogClose,
    HlmAlertDialogImports,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ config().resourceNamePlural }}</h1>
          @if (config().description) {
            <p class="text-muted-foreground">{{ config().description }}</p>
          }
        </div>
        @if (actions().create !== false) {
          <a hlmBtn routerLink="new">
            <ng-icon hlm name="lucidePlus" size="sm" class="mr-2" />
            {{ config().addLabel ?? 'Add ' + config().resourceName }}
          </a>
        }
      </div>

      @if (config().searchable) {
        <div class="flex items-center gap-2">
          <div class="relative max-w-sm flex-1">
            <ng-icon hlm name="lucideSearch" size="sm" class="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              hlmInput
              class="pl-9"
              [placeholder]="'Search ' + config().resourceNamePlural.toLowerCase() + '...'"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearch($event)"
            />
          </div>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-12">
          <hlm-spinner size="lg" />
        </div>
      } @else {
        <div hlmTableContainer>
          <table hlmTable>
            <thead>
              <tr hlmTrow>
                @for (col of config().columns; track col.key) {
                  <th hlmTh [class]="headerClass(col)">{{ col.header }}</th>
                }
                @if (hasRowActions()) {
                  <th hlmTh class="w-32 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track itemId(item)) {
                <tr hlmTrow>
                  @for (col of config().columns; track col.key) {
                    <td hlmTd [class]="cellCls(col)">
                      @switch (col.type ?? 'text') {
                        @case ('image') {
                          <img [src]="rawValue(item, col)" alt="" class="size-10 rounded-md object-cover" />
                        }
                        @case ('badge') {
                          <span hlmBadge [variant]="col.badgeVariant ?? 'secondary'">{{ cellValue(item, col) }}</span>
                        }
                        @case ('badges') {
                          <div class="flex gap-1">
                            @for (badge of cellArray(item, col).slice(0, col.maxBadges ?? 3); track badge) {
                              <span hlmBadge [variant]="col.badgeVariant ?? 'secondary'" class="text-xs">{{ badge }}</span>
                            }
                            @if (cellArray(item, col).length > (col.maxBadges ?? 3)) {
                              <span hlmBadge variant="outline" class="text-xs">
                                +{{ cellArray(item, col).length - (col.maxBadges ?? 3) }}
                              </span>
                            }
                          </div>
                        }
                        @case ('currency') {
                          \${{ cellValue(item, col) }}
                        }
                        @default {
                          {{ cellValue(item, col) }}
                        }
                      }
                    </td>
                  }
                  @if (hasRowActions()) {
                    <td hlmTd class="text-right">
                      <div class="flex justify-end gap-1">
                        @if (actions().view !== false) {
                          <a hlmBtn variant="ghost" size="icon" [routerLink]="[itemId(item)]">
                            <ng-icon hlm name="lucideEye" size="sm" />
                          </a>
                        }
                        @if (actions().edit !== false) {
                          <a hlmBtn variant="ghost" size="icon" [routerLink]="[itemId(item), 'edit']">
                            <ng-icon hlm name="lucidePencil" size="sm" />
                          </a>
                        }
                        @if (actions().delete !== false) {
                          <brn-alert-dialog>
                            <button brnAlertDialogTrigger hlmBtn variant="ghost" size="icon">
                              <ng-icon hlm name="lucideTrash2" size="sm" class="text-destructive" />
                            </button>
                            <ng-template hlmAlertDialogPortal>
                              <hlm-alert-dialog-overlay />
                              <hlm-alert-dialog-content>
                                <hlm-alert-dialog-header>
                                  <h2 hlmAlertDialogTitle>
                                    {{ config().deleteConfirmTitle ?? 'Delete ' + config().resourceName }}
                                  </h2>
                                  <p hlmAlertDialogDescription>{{ deleteDescription(item) }}</p>
                                </hlm-alert-dialog-header>
                                <hlm-alert-dialog-footer>
                                  <button hlmAlertDialogCancel brnDialogClose>Cancel</button>
                                  <button hlmAlertDialogAction brnDialogClose (click)="itemDelete.emit(item)">
                                    Delete
                                  </button>
                                </hlm-alert-dialog-footer>
                              </hlm-alert-dialog-content>
                            </ng-template>
                          </brn-alert-dialog>
                        }
                      </div>
                    </td>
                  }
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd [colSpan]="colSpan()" class="text-muted-foreground text-center">
                    No {{ config().resourceNamePlural.toLowerCase() }} found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <hlm-numbered-pagination
          [(currentPage)]="currentPage"
          [(itemsPerPage)]="itemsPerPage"
          [totalItems]="totalItems()"
          [pageSizes]="config().pageSizes ?? [10, 20, 50]"
        />
      }
    </div>
  `,
})
export class DynCrudListComponent {
  readonly config = input.required<DynCrudListConfig>();
  readonly items = input<unknown[]>([]);
  readonly totalItems = input(0);
  readonly loading = input(false);

  readonly currentPage = model(1);
  readonly itemsPerPage = model(10);

  readonly searchChange = output<string>();
  readonly itemDelete = output<unknown>();

  protected readonly searchQuery = signal('');

  protected readonly actions = computed(() => ({
    view: true,
    edit: true,
    delete: true,
    create: true,
    ...this.config().actions,
  }));

  protected readonly hasRowActions = computed(() => {
    const a = this.actions();
    return a.view || a.edit || a.delete;
  });

  protected readonly colSpan = computed(() => this.config().columns.length + (this.hasRowActions() ? 1 : 0));

  protected onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.searchChange.emit(query);
  }

  protected itemId(item: unknown): unknown {
    return (item as Record<string, unknown>)[this.config().idKey ?? 'id'];
  }

  protected rawValue(item: unknown, col: DynCrudColumn): unknown {
    return getNestedValue(item, col.key);
  }

  protected cellValue(item: unknown, col: DynCrudColumn): string {
    const value = this.rawValue(item, col);
    if (col.format) return col.format(value, item);
    if (col.type === 'currency') return (value as number).toFixed(2);
    if (col.type === 'number') return String(value ?? '');
    return String(value ?? '');
  }

  protected cellArray(item: unknown, col: DynCrudColumn): unknown[] {
    const value = this.rawValue(item, col);
    return Array.isArray(value) ? value : [];
  }

  protected headerClass(col: DynCrudColumn): string {
    const classes: string[] = [];
    if (col.width) classes.push(col.width);
    if (col.align === 'right') classes.push('text-right');
    if (col.align === 'center') classes.push('text-center');
    return classes.join(' ');
  }

  protected cellCls(col: DynCrudColumn): string {
    const classes: string[] = [];
    if (col.align === 'right') classes.push('text-right');
    if (col.align === 'center') classes.push('text-center');
    if (col.cellClass) classes.push(col.cellClass);
    return classes.join(' ');
  }

  protected deleteDescription(item: unknown): string {
    return this.config().deleteConfirmDescription?.(item) ?? 'Are you sure? This action cannot be undone.';
  }
}
