import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

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
