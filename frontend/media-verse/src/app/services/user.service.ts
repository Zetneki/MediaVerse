import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ThemeName } from '../utils/theme.registry';
import { ColorMode } from '../utils/theme.type';
import { UserTheme } from '../models/usertheme';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

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

  //buyTheme(themeName: ThemeName) {}

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
