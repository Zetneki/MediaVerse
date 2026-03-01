import { Component, effect, signal } from '@angular/core';
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
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SkeletonDetailsComponent } from '../../components/skeleton-details/skeleton-details.component';
import { SelectModule } from 'primeng/select';
import { ThemeService } from '../../services/theme.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { shouldHandleError } from '../../utils/error-handler';
import { ThemeName } from '../../utils/theme.registry';
import { filter } from 'rxjs';
import { ColorMode } from '../../utils/theme.type';

@Component({
  selector: 'app-profile',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    PasswordModule,
    InplaceModule,
    InputTextModule,
    ProgressBar,
    ConfirmDialogModule,
    SkeletonDetailsComponent,
    SelectModule,
    FormsModule,
    SelectButtonModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user!: User;
  usernameChangeForm!: FormGroup;
  passwordChangeForm!: FormGroup;
  loading: boolean = false;
  passwordErrors: string[] = [];
  closable: boolean = false;

  openState = {
    username: false,
    password: false,
  };

  toggle(key: 'username' | 'password') {
    this.openState[key] = !this.openState[key];
  }

  themes: ThemeName[] = [];

  currentTheme: ThemeName = 'indigo';

  systemModes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  selectedMode: ColorMode = 'system';

  isLargeScreen = signal<boolean>(window.innerWidth > 1024);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private themeService: ThemeService,
  ) {
    this.authService.currentUser$
      .pipe(filter((user): user is User => !!user))
      .subscribe((user) => {
        this.user = user;
        this.currentTheme = user.active_theme;
        this.selectedMode = user.active_dark_light_mode;

        this.userService.getUserThemes().then((themes) => {
          this.themes = themes.map((t) => t.name);
        });
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
        oldPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$'),
          ],
        ],
        newPasswordConfirmation: ['', [Validators.required]],
      },
      {
        validators: [this.passwordsMatchValidator],
      },
    );

    const passwordControl = this.passwordChangeForm.get('newPassword');

    passwordControl?.valueChanges.subscribe(() => {
      this.updatePasswordErrors(passwordControl);
    });

    this.selectedMode = this.themeService.getMode();
    this.setupResizeListener();
  }

  private setupResizeListener() {
    const handleResize = () => {
      this.isLargeScreen.set(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);

    effect(() => {
      return () => window.removeEventListener('resize', handleResize);
    });
  }

  get buttonSize() {
    return this.isLargeScreen() ? undefined : 'small';
  }

  async onThemeChange() {
    try {
      this.themeService.applyTheme(this.currentTheme);

      await this.userService.updateActiveTheme(this.currentTheme);

      if (this.user) {
        this.authService.updateCurrentUser({
          ...this.user,
          active_theme: this.currentTheme,
        });
      }
    } catch (err) {
      this.notificationService.error('Failed to save theme');
    }
  }

  async onModeChange() {
    try {
      this.themeService.setMode(this.selectedMode);

      await this.userService.updateActiveMode(this.selectedMode);

      if (this.user) {
        this.authService.updateCurrentUser({
          ...this.user,
          active_dark_light_mode: this.selectedMode,
        });
      }
    } catch (err) {
      this.notificationService.error('Failed to save dark-light mode');
    }
  }

  get disabledUsernameChange() {
    return this.usernameChangeForm.invalid;
  }

  get disabledPasswordChange() {
    return this.passwordChangeForm.invalid;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('newPasswordConfirmation')?.value;

    return password && confirm && password !== confirm
      ? { passwordsMismatch: true }
      : null;
  }

  private updatePasswordErrors(control: AbstractControl | null) {
    this.passwordErrors = [];

    if (!control || !control.errors) {
      return;
    }

    if (control.errors['required']) {
      this.passwordErrors.push('Password is required');
    }

    if (control.errors['minlength']) {
      this.passwordErrors.push('Minimum 8 characters');
    }

    if (control.errors['pattern']) {
      this.passwordErrors.push('Must contain uppercase, lowercase and number');
    }
  }

  onLogout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out all of your devices?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Logout',
      },
      accept: () => {
        this.authService.logout().subscribe({
          next: (res: any) => {
            this.notificationService.success(
              res.message ?? 'Logged out successfully',
            );
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.notificationService.error(err.error?.error ?? 'Logout failed');
            this.router.navigate(['/login']);
          },
        });
      },
    });
  }

  onUsernameChange() {
    if (this.usernameChangeForm.invalid) {
      this.usernameChangeForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to change your username?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'success',
        label: 'Save',
      },
      accept: () => {
        this.loading = true;
        const { newUsername } = this.usernameChangeForm.value;

        this.userService.changeUsername(newUsername).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.notificationService.success(
              res.message ?? 'Username changed successfully',
            );
            this.authService.updateCurrentUser(res.user);
            this.openState.username = false;
            this.usernameChangeForm.reset();
          },
          error: (err) => {
            this.loading = false;
            if (!shouldHandleError(err)) return;

            const errors = err.error?.errors ?? [];
            if (err.error?.error) {
              errors.push(err.error.error);
            }

            if (errors.length === 0) errors.push('Username change failed');
            this.notificationService.error(errors);
          },
        });
      },
    });
  }

  onPasswordChange() {
    if (this.passwordChangeForm.invalid) {
      this.passwordChangeForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to change your password?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'success',
        label: 'Save',
      },
      accept: () => {
        this.loading = true;
        const { oldPassword, newPassword } = this.passwordChangeForm.value;

        this.userService.changePassword(oldPassword, newPassword).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.notificationService.success(
              res.message ?? 'Password changed successfully',
            );
            this.authService.clearAuth();
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.loading = false;
            if (!shouldHandleError(err)) return;

            const errors = err.error?.errors ?? [];
            if (err.error?.error) {
              errors.push(err.error.error);
            }

            if (errors.length === 0) errors.push('Password change failed');
            this.notificationService.error(errors);
          },
        });
      },
    });
  }

  onDeleteAccount() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your account?',
      header: 'Confirmation',
      closeOnEscape: true,
      dismissableMask: true,
      rejectButtonProps: {
        severity: 'secondary',
        label: 'Cancel',
      },
      acceptButtonProps: {
        severity: 'danger',
        label: 'Delete',
      },
      accept: () => {
        this.loading = true;

        this.userService.deleteAccount().subscribe({
          next: (res: any) => {
            this.loading = false;
            this.authService.clearAuth();
            this.router.navigate(['/login']);
            this.notificationService.success(
              res.message ?? 'Account deleted successfully',
            );
          },
          error: (err) => {
            this.loading = false;
            if (shouldHandleError(err)) {
              this.notificationService.error(
                err.error?.error ?? 'Account deletion failed',
              );
            }
          },
        });
      },
    });
  }
}
