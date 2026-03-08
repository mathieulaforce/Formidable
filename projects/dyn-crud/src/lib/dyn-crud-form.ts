import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { DynFormComponent, type DynFieldConfig } from 'dyn-form';
import type { DynCrudFormConfig } from './models';

@Component({
  selector: 'dyn-crud-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowLeft })],
  imports: [RouterLink, DynFormComponent, HlmCardImports, HlmButtonImports, HlmIconImports, HlmSpinnerImports],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a hlmBtn variant="outline" size="icon" [routerLink]="config().basePath">
          <ng-icon hlm name="lucideArrowLeft" size="sm" />
        </a>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ isEdit() ? config().editTitle : config().createTitle }}
          </h1>
          @if (isEdit() ? config().editDescription : config().createDescription; as desc) {
            <p class="text-muted-foreground">{{ desc }}</p>
          }
        </div>
      </div>

      <section hlmCard class="max-w-2xl">
        <div hlmCardContent class="pt-6">
          <dyn-form
            #dynForm
            [fields]="fields()"
            [value]="value()"
            [columns]="config().columns ?? 1"
            (formSubmit)="formSubmit.emit($event)"
          >
            <div class="flex justify-end gap-2 pt-4">
              <a hlmBtn variant="outline" [routerLink]="config().basePath">Cancel</a>
              <button hlmBtn type="submit" [disabled]="saving() || dynForm.invalid">
                @if (saving()) {
                  <hlm-spinner size="sm" class="mr-2" />
                }
                {{ isEdit() ? 'Update' : 'Create' }}
              </button>
            </div>
          </dyn-form>
        </div>
      </section>
    </div>
  `,
})
export class DynCrudFormComponent {
  readonly config = input.required<DynCrudFormConfig>();
  readonly fields = input.required<DynFieldConfig[]>();
  readonly value = input<Record<string, unknown>>();
  readonly saving = input(false);
  readonly id = input<string>();

  readonly formSubmit = output<Record<string, unknown>>();

  protected readonly isEdit = computed(() => !!this.id());
}
