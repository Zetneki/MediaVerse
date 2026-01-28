import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { LoginResponse } from '../models/loginresponse';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/users/register`, {
      username,
      password,
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/users/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          this.currentUserSubject.next(res.user);
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  get token() {
    return localStorage.getItem('token');
  }

  loadUserFromToken() {
    if (!this.token) return;

    this.http.get<User>(`${this.baseUrl}/users/me`).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.logout(),
    });
  }

  updateCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
