import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import type { AuthUser, LoginRequest, LoginResponse, RefreshResponse } from './auth.models';

const API_URL = 'https://dummyjson.com/auth';
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _accessToken = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly loading = this._loading.asReadonly();

  get accessToken(): string | null {
    return this._accessToken();
  }

  login(credentials: LoginRequest) {
    this._loading.set(true);
    return this.http.post<LoginResponse>(`${API_URL}/login`, credentials).pipe(
      tap((response) => {
        this.storeTokens(response.accessToken, response.refreshToken);
        this._user.set({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          gender: response.gender,
          image: response.image,
        });
        this._loading.set(false);
      }),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      }),
    );
  }

  loadCurrentUser() {
    if (!this._accessToken()) return EMPTY;
    return this.http.get<AuthUser>(`${API_URL}/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError(() => {
        this.clearAuth();
        return EMPTY;
      }),
    );
  }

  refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return EMPTY;

    return this.http
      .post<RefreshResponse>(`${API_URL}/refresh`, {
        refreshToken,
        expiresInMins: 30,
      })
      .pipe(
        tap((response) => this.storeTokens(response.accessToken, response.refreshToken)),
        catchError(() => {
          this.clearAuth();
          return EMPTY;
        }),
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    this._accessToken.set(accessToken);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this._accessToken.set(null);
    this._user.set(null);
  }
}
