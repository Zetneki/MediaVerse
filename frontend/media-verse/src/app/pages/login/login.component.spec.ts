// Unit tests for LoginComponent

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Observable } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
    ]);
    authService.login.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillForm(username: string, password: string) {
    component.loginForm.setValue({ username, password });
  }

  // ── form initialization ──────────────────────────────────────────────────
  describe('form initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty fields', () => {
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should be invalid when both fields are empty', () => {
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('disabled getter should return true when form is invalid', () => {
      expect(component.disabled).toBeTrue();
    });

    it('loading should be false initially', () => {
      expect(component.loading).toBeFalse();
    });
  });

  // ── form validation ──────────────────────────────────────────────────────
  describe('form validation', () => {
    it('should be invalid when username is empty', () => {
      fillForm('', 'Password1');
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('should be invalid when password is empty', () => {
      fillForm('testuser', '');
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('should be valid when both fields are filled', () => {
      fillForm('testuser', 'Password1');
      expect(component.loginForm.valid).toBeTrue();
    });

    it('disabled getter should return false when form is valid', () => {
      fillForm('testuser', 'Password1');
      expect(component.disabled).toBeFalse();
    });

    it('username field should have required error when empty', () => {
      component.loginForm.get('username')?.setValue('');
      expect(
        component.loginForm.get('username')?.errors?.['required'],
      ).toBeTrue();
    });

    it('password field should have required error when empty', () => {
      component.loginForm.get('password')?.setValue('');
      expect(
        component.loginForm.get('password')?.errors?.['required'],
      ).toBeTrue();
    });
  });

  // ── onLogin – invalid form ───────────────────────────────────────────────
  describe('onLogin – invalid form', () => {
    it('should not call authService.login when form is invalid', () => {
      component.onLogin();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitted empty', () => {
      component.onLogin();
      expect(component.loginForm.get('username')?.touched).toBeTrue();
      expect(component.loginForm.get('password')?.touched).toBeTrue();
    });
  });

  // ── onLogin – successful login ───────────────────────────────────────────
  describe('onLogin – successful login', () => {
    beforeEach(() => {
      authService.login.and.returnValue(of({} as any));
      fillForm('testuser', 'Password1');
    });

    it('should call authService.login with correct credentials', () => {
      component.onLogin();
      expect(authService.login).toHaveBeenCalledWith('testuser', 'Password1');
    });

    it('should navigate to /home after successful login', () => {
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should show success notification', () => {
      component.onLogin();
      expect(notificationService.success).toHaveBeenCalledWith(
        'Login successful',
      );
    });

    it('should set loading to false after success', () => {
      component.onLogin();
      expect(component.loading).toBeFalse();
    });
  });

  // ── onLogin – failed login ───────────────────────────────────────────────
  describe('onLogin – failed login', () => {
    it('should set loading to false after error', () => {
      authService.login.and.returnValue(
        throwError(() => ({
          status: 401,
          error: { error: 'Invalid credentials' },
        })),
      );
      fillForm('testuser', 'wrongpass');
      component.onLogin();
      expect(component.loading).toBeFalse();
    });

    it('should not navigate on failed login', () => {
      authService.login.and.returnValue(
        throwError(() => ({ status: 401, error: {} })),
      );
      fillForm('testuser', 'wrongpass');
      component.onLogin();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // ── loading state ────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('should set loading to true while request is pending', () => {
      authService.login.and.returnValue(new Observable(() => {}));
      fillForm('testuser', 'Password1');
      component.onLogin();
      expect(component.loading).toBeTrue();
    });
  });
});
