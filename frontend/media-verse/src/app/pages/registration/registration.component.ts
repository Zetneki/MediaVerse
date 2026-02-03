import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DemoMarqueeComponent } from '../../components/demo-marquee/demo-marquee.component';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-registration',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    RouterLink,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    DemoMarqueeComponent,
    ProgressBar,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  registerForm!: FormGroup;
  loading = false;
  passwordErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$'),
          ],
        ],
        passwordConfirmation: ['', [Validators.required]],
      },
      {
        validators: [this.passwordsMatchValidator],
      },
    );

    const passwordControl = this.registerForm.get('password');

    passwordControl?.valueChanges.subscribe(() => {
      this.updatePasswordErrors(passwordControl);
    });
  }

  get disabled() {
    return this.registerForm.invalid;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('passwordConfirmation')?.value;

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

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { username, password } = this.registerForm.value;

    this.authService.register(username, password).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.router.navigate(['/login']);
        this.notificationService.success(
          res.message ?? 'User created successfully',
        );
      },
      error: (err) => {
        this.loading = false;

        const errors = err.error?.errors ?? [];
        if (err.error?.error) {
          errors.push(err.error.error);
        }

        if (errors.length === 0) errors.push('Registration failed');
        this.notificationService.error(errors);
      },
    });
  }
}
