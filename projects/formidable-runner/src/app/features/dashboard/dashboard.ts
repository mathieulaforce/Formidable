import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideFileText, lucideListChecks, lucidePackage } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePackage, lucideFileText, lucideListChecks, lucideArrowRight })],
  imports: [RouterLink, HlmCardImports, HlmButtonImports, HlmIconImports],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">Welcome to the Formidable enterprise dashboard.</p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        @for (card of cards; track card.route) {
          <section hlmCard>
            <div hlmCardHeader class="flex flex-row items-center justify-between pb-2">
              <h3 hlmCardTitle class="text-sm font-medium">{{ card.title }}</h3>
              <ng-icon hlm [name]="card.icon" size="sm" class="text-muted-foreground" />
            </div>
            <div hlmCardContent>
              <p class="text-muted-foreground text-sm">{{ card.description }}</p>
            </div>
            <div hlmCardFooter>
              <a hlmBtn variant="outline" size="sm" [routerLink]="card.route">
                Browse
                <ng-icon hlm name="lucideArrowRight" size="sm" class="ml-1" />
              </a>
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export default class Dashboard {
  protected readonly cards = [
    {
      title: 'Products',
      icon: 'lucidePackage',
      description: 'Manage product catalog with full CRUD operations.',
      route: '/products',
    },
    {
      title: 'Posts',
      icon: 'lucideFileText',
      description: 'Create, read, update and delete blog posts.',
      route: '/posts',
    },
    {
      title: 'Todos',
      icon: 'lucideListChecks',
      description: 'Track tasks with create, update and delete support.',
      route: '/todos',
    },
  ];
}
