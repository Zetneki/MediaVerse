import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../types/theme.type';
import { UserTheme } from '../models/usertheme';
import { environment } from '../../environments/environment';
import { UserActivity } from '../models/useractivity';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  activityRefreshSignal = signal(0);

  triggerActivityRefresh() {
    this.activityRefreshSignal.update((v) => v + 1);
  }

  getActivity(): Promise<UserActivity[]> {
    return firstValueFrom(
      this.http.get<UserActivity[]>(`${this.baseUrl}/users/activity`),
    );
  }

  updateActiveMode(modeName: ColorMode): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${this.baseUrl}/users/active-mode`, { modeName }),
    );
  }

  updateActiveTheme(themeName: ThemeName): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${this.baseUrl}/users/active-theme`, { themeName }),
    );
  }

  getUserThemes(): Promise<UserTheme[]> {
    return firstValueFrom(
      this.http.get<UserTheme[]>(`${this.baseUrl}/user-themes`),
    );
  }

  changeUsername(newUsername: string) {
    return this.http.put(`${this.baseUrl}/users/change-username`, {
      newUsername,
    });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put(`${this.baseUrl}/users/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  deleteAccount() {
    return this.http.delete(`${this.baseUrl}/users/me`);
  }
}
