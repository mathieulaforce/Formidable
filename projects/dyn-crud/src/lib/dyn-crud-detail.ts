import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePencil } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'dyn-crud-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowLeft, lucidePencil })],
  imports: [RouterLink, HlmButtonImports, HlmIconImports, HlmSpinnerImports],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12">
        <hlm-spinner size="lg" />
      </div>
    } @else {
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <a hlmBtn variant="outline" size="icon" [routerLink]="basePath()">
            <ng-icon hlm name="lucideArrowLeft" size="sm" />
          </a>
          <div class="flex-1">
            <h1 class="text-3xl font-bold tracking-tight">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="text-muted-foreground">{{ subtitle() }}</p>
            }
          </div>
          @if (showEdit()) {
            <a hlmBtn routerLink="edit">
              <ng-icon hlm name="lucidePencil" size="sm" class="mr-2" />
              Edit
            </a>
          }
        </div>
        <ng-content />
      </div>
    }
  `,
})
export class DynCrudDetailComponent {
  readonly basePath = input.required<string>();
  readonly title = input('');
  readonly subtitle = input('');
  readonly loading = input(false);
  readonly showEdit = input(true);
}
