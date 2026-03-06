import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideFileText,
  lucideLayoutDashboard,
  lucideListChecks,
  lucideLogOut,
  lucidePackage,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    HlmSidebarService,
    provideIcons({
      lucideLayoutDashboard,
      lucidePackage,
      lucideFileText,
      lucideListChecks,
      lucideLogOut,
    }),
  ],
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmSidebarImports,
    HlmButtonImports,
    HlmIconImports,
    HlmSeparatorImports,
  ],
  template: `
    <hlm-sidebar-wrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="p-4">
          <h2 class="text-lg font-semibold tracking-tight">Formidable</h2>
          <p class="text-muted-foreground text-sm">Enterprise Dashboard</p>
        </div>
        <hlm-separator />
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupLabel>Navigation</div>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of navItems; track item.route) {
                  <li hlmSidebarMenuItem>
                    <a
                      hlmSidebarMenuButton
                      [routerLink]="item.route"
                      routerLinkActive="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <ng-icon hlm [name]="item.icon" size="sm" />
                      <span>{{ item.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
        <div hlmSidebarFooter class="p-2">
          @if (auth.user(); as user) {
            <div class="flex items-center gap-3 rounded-md px-2 py-1.5">
              <img [src]="user.image" [alt]="user.firstName" class="size-8 rounded-full" />
              <div class="flex flex-col overflow-hidden">
                <span class="truncate text-sm font-medium">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="text-muted-foreground truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          }
          <button hlmBtn variant="ghost" class="w-full justify-start" (click)="auth.logout()">
            <ng-icon hlm name="lucideLogOut" size="sm" class="mr-2" />
            Sign out
          </button>
        </div>
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="flex h-14 items-center gap-2 border-b px-4">
          <button hlmSidebarTrigger></button>
        </header>
        <div class="flex-1 p-6">
          <router-outlet />
        </div>
      </main>
    </hlm-sidebar-wrapper>
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);

  protected readonly navItems = [
    { route: '/dashboard', label: 'Dashboard', icon: 'lucideLayoutDashboard' },
    { route: '/products', label: 'Products', icon: 'lucidePackage' },
    { route: '/posts', label: 'Posts', icon: 'lucideFileText' },
    { route: '/todos', label: 'Todos', icon: 'lucideListChecks' },
  ];
}
