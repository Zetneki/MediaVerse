import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  lastValueFrom,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { LoginResponse } from '../models/loginresponse';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  register(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/users/register`, {
      username,
      password,
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/users/login`,
        {
          username,
          password,
        },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          this.accessToken = res.accessToken;
          this.currentUserSubject.next(res.user);
        }),
      );
  }

  refreshAccessToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{
        accessToken: string;
      }>(`${this.baseUrl}/users/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.accessToken = res.accessToken;
        }),
        catchError((err: any) => {
          this.clearAuth();
          return throwError(() => err);
        }),
      );
  }

  logout() {
    return this.http
      .post(`${this.baseUrl}/users/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearAuth()),
        catchError((err) => {
          this.clearAuth();
          return throwError(() => err);
        }),
      );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAuth(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
  }

  async loadUserFromToken(): Promise<void> {
    try {
      const user = await lastValueFrom(
        this.http.get<User>(`${this.baseUrl}/users/me`),
      );

      this.currentUserSubject.next(user);
    } catch (error) {
      this.clearAuth();
    }
  }

  updateCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
