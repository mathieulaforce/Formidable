import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmSpinnerImports,
  ],
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
      <section hlmCard class="w-full max-w-md">
        <div hlmCardHeader>
          <h1 hlmCardTitle class="text-2xl">Sign in</h1>
          <p hlmCardDescription>Enter your credentials to access the dashboard</p>
        </div>
        <div hlmCardContent>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label hlmLabel for="username">Username</label>
              <input hlmInput id="username" formControlName="username" placeholder="emilys" autocomplete="username" />
            </div>
            <div class="flex flex-col gap-2">
              <label hlmLabel for="password">Password</label>
              <input
                hlmInput
                id="password"
                type="password"
                formControlName="password"
                placeholder="emilyspass"
                autocomplete="current-password"
              />
            </div>
            @if (error()) {
              <p class="text-destructive text-sm">{{ error() }}</p>
            }
            <button hlmBtn type="submit" class="w-full" [disabled]="loading()">
              @if (loading()) {
                <hlm-spinner size="sm" class="mr-2" />
              }
              Sign in
            </button>
          </form>
        </div>
        <div hlmCardFooter>
          <p class="text-muted-foreground text-center text-xs">
            Try <strong>emilys</strong> / <strong>emilyspass</strong>
          </p>
        </div>
      </section>
    </div>
  `,
})
export default class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { username, password } = this.form.getRawValue();
    this.auth.login({ username, password }).subscribe({
      next: () => {
        toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed. Please try again.');
      },
    });
  }
}
