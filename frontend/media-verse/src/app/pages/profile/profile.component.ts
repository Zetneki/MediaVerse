import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, ReactiveFormsModule, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user!: User;
  usernameChangeForm!: FormGroup;
  passwordChangeForm!: FormGroup;
  loading: boolean = false;
  hibateszt: string[] = ['hiba', 'hibát', 'hibás', 'hibája', 'hibájuk'];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private fb: FormBuilder,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user!;
    });

    this.usernameChangeForm = this.fb.group({
      newUsername: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
    });
    this.passwordChangeForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$'),
          ],
        ],
        newPasswordConfirmation: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$'),
          ],
        ],
      },
      {
        validators: [this.passwordsMatchValidator],
      },
    );
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('newPasswordConfirmation')?.value;

    return password && confirm && password !== confirm
      ? { passwordsMismatch: true }
      : null;
  }

  onLogout() {
    this.authService.logout();
    this.notificationService.success('Logged out successfully');
    this.router.navigate(['/login']);
  }

  onUsernameChange() {
    if (this.usernameChangeForm.invalid) {
      this.usernameChangeForm.markAllAsTouched();
      return;
    }

    if (!confirm('Are you sure you want to change username?')) return;

    this.loading = true;
    const { newUsername } = this.usernameChangeForm.value;

    this.userService.changeUsername(newUsername).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.notificationService.success(
          res.message ?? 'Username changed successfully',
        );
        this.authService.updateCurrentUser(res.user);
      },
      error: (err) => {
        this.loading = false;

        const errors = err.error?.errors ?? [];
        if (err.error?.error) {
          errors.push(err.error.error);
        }

        if (errors.length === 0) errors.push('Username change failed');
        this.notificationService.error(errors);
      },
    });
  }

  onPasswordChange() {
    if (this.passwordChangeForm.invalid) {
      this.passwordChangeForm.markAllAsTouched();
      return;
    }

    if (!confirm('Are you sure you want to change password?')) return;

    this.loading = true;
    const { oldPassword, newPassword } = this.passwordChangeForm.value;

    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.notificationService.success(
          res.message ?? 'Password changed successfully',
        );
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;

        const errors = err.error?.errors ?? [];
        if (err.error?.error) {
          errors.push(err.error.error);
        }

        if (errors.length === 0) errors.push('Password change failed');
        this.notificationService.error(errors);
      },
    });
  }

  onDeleteAccount() {
    if (!confirm('This action is irreversible')) return;
    this.loading = true;

    this.userService.deleteAccount().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.authService.logout();
        this.router.navigate(['/login']);
        this.notificationService.success(
          res.message ?? 'Account deleted successfully',
        );
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(
          err.error?.error ?? 'Account deletion failed',
        );
      },
    });
  }
}
