import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string | null;
  created_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private accessToken$ = new BehaviorSubject<string | null>(null);
  readonly token$ = this.accessToken$.asObservable();

  // Prefer reading from env exposed at runtime or default to local
  private get apiBase(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = typeof window !== 'undefined' ? window : undefined;
    const fromEnv = w?.env?.API_BASE_URL ?? w?.API_BASE_URL;
    return fromEnv || 'http://localhost:3001';
  }

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (saved) {
      this.accessToken$.next(saved);
    }
  }

  get token(): string | null {
    return this.accessToken$.value;
  }

  setToken(token: string | null) {
    this.accessToken$.next(token);
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  register(req: RegisterRequest): Observable<boolean> {
    return this.http
      .post<TokenResponse>(`${this.apiBase}/auth/register`, req, { withCredentials: true })
      .pipe(
        tap((res) => this.setToken(res.access_token)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  login(req: LoginRequest): Observable<boolean> {
    return this.http
      .post<TokenResponse>(`${this.apiBase}/auth/login`, req, { withCredentials: true })
      .pipe(
        tap((res) => this.setToken(res.access_token)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  logout(): Observable<boolean> {
    return this.http
      .post<{ message: string }>(`${this.apiBase}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.setToken(null)),
        tap(() => this.router.navigateByUrl('/login')),
        map(() => true),
        catchError(() => of(false))
      );
  }

  me(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${this.apiBase}/auth/me`, { withCredentials: true }).pipe(
      catchError(() => of(null))
    );
  }

  refresh(): Observable<boolean> {
    return this.http
      .post<TokenResponse>(`${this.apiBase}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => this.setToken(res.access_token)),
        map(() => true),
        catchError(() => of(false))
      );
  }
}
