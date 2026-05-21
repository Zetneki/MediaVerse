// auth.service.spec.ts
// Unit tests for AuthService
// HttpClient is mocked via HttpClientTestingModule – no real HTTP calls.
// Run: ng test --include="auth.service.spec.ts"

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const themeServiceMock = {
  setMode: jasmine.createSpy('setMode'),
  applyTheme: jasmine.createSpy('applyTheme'),
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const MOCK_USER: User = {
  id: 1,
  username: 'testuser',
  active_theme: 'indigo',
  active_dark_light_mode: 'system',
  wallet_address: '',
  wallet_verified: false,
  wallet_last_verified: '',
  created_at: '2024-01-01T00:00:00.000Z',
};

const MOCK_LOGIN_RESPONSE = {
  user: MOCK_USER,
  accessToken: 'mock-access-token',
};

const BASE = environment.baseUrl;

// ===========================================================================
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    themeServiceMock.setMode.calls.reset();
    themeServiceMock.applyTheme.calls.reset();
  });

  afterEach(() => {
    httpMock.verify(); // fail if unexpected HTTP requests were made
  });

  // ── initial state ────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('should have no access token on creation', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should not be logged in on creation', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('currentUser$ should emit null on creation', (done) => {
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  // ── login ────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should POST to /users/login with credentials', () => {
      service.login('testuser', 'Password1').subscribe();

      const req = httpMock.expectOne(`${BASE}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'Password1',
      });
      req.flush(MOCK_LOGIN_RESPONSE);
    });

    it('should store accessToken after successful login', () => {
      service.login('testuser', 'Password1').subscribe();

      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      expect(service.getAccessToken()).toBe('mock-access-token');
    });

    it('should emit user via currentUser$ after login', (done) => {
      let emitCount = 0;
      service.currentUser$.subscribe((user) => {
        emitCount++;
        if (emitCount === 2) {
          expect(user).toEqual(MOCK_USER);
          done();
        }
      });

      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);
    });

    it('should call themeService.setMode with user mode after login', () => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      expect(themeServiceMock.setMode).toHaveBeenCalledWith('system');
    });

    it('should call themeService.applyTheme with user theme after login', () => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      expect(themeServiceMock.applyTheme).toHaveBeenCalledWith('indigo');
    });

    it('should be logged in after successful login', () => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should propagate HTTP error on failed login', (done) => {
      service.login('testuser', 'wrong').subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
          done();
        },
      });

      httpMock
        .expectOne(`${BASE}/users/login`)
        .flush(
          { error: 'Invalid credentials' },
          { status: 401, statusText: 'Unauthorized' },
        );
    });
  });

  // ── register ─────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should POST to /users/register with username and password', () => {
      service.register('newuser', 'Password1').subscribe();

      const req = httpMock.expectOne(`${BASE}/users/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'newuser',
        password: 'Password1',
      });
      req.flush(
        { message: 'User created successfully' },
        { status: 201, statusText: 'Created' },
      );
    });

    it('should propagate conflict error when username already exists', (done) => {
      service.register('existing', 'Password1').subscribe({
        error: (err) => {
          expect(err.status).toBe(409);
          done();
        },
      });

      httpMock
        .expectOne(`${BASE}/users/register`)
        .flush(
          { error: 'Username already exists' },
          { status: 409, statusText: 'Conflict' },
        );
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────
  describe('logout', () => {
    beforeEach(() => {
      // Set up logged-in state
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);
    });

    it('should POST to /users/logout', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne(`${BASE}/users/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logged out successfully' });
    });

    it('should clear accessToken after logout', () => {
      service.logout().subscribe();
      httpMock.expectOne(`${BASE}/users/logout`).flush({});

      expect(service.getAccessToken()).toBeNull();
    });

    it('should emit null via currentUser$ after logout', () => {
      service.logout().subscribe();
      httpMock.expectOne(`${BASE}/users/logout`).flush({});

      let lastUser: any = 'not-checked';
      service.currentUser$.subscribe((user) => {
        lastUser = user;
      });
      expect(lastUser).toBeNull();
    });

    it('should clear auth even if logout request fails', () => {
      service.logout().subscribe({ error: () => {} });
      httpMock
        .expectOne(`${BASE}/users/logout`)
        .flush({}, { status: 500, statusText: 'Server Error' });

      expect(service.getAccessToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  // ── refreshAccessToken ───────────────────────────────────────────────────
  describe('refreshAccessToken', () => {
    it('should POST to /users/refresh', () => {
      service.refreshAccessToken().subscribe();

      const req = httpMock.expectOne(`${BASE}/users/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush({ accessToken: 'new-token' });
    });

    it('should update accessToken on successful refresh', () => {
      service.refreshAccessToken().subscribe();
      httpMock
        .expectOne(`${BASE}/users/refresh`)
        .flush({ accessToken: 'new-token' });

      expect(service.getAccessToken()).toBe('new-token');
    });

    it('should clear auth and rethrow on refresh failure', (done) => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      service.refreshAccessToken().subscribe({
        error: () => {
          expect(service.isLoggedIn()).toBeFalse();
          expect(service.getAccessToken()).toBeNull();
          done();
        },
      });

      httpMock
        .expectOne(`${BASE}/users/refresh`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ── clearAuth ────────────────────────────────────────────────────────────
  describe('clearAuth', () => {
    it('should clear token and user', () => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      service.clearAuth();

      expect(service.getAccessToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  // ── loadUserFromToken ─────────────────────────────────────────────────────
  describe('loadUserFromToken', () => {
    it('should GET /users/me and set current user', async () => {
      const promise = service.loadUserFromToken();

      httpMock.expectOne(`${BASE}/users/me`).flush(MOCK_USER);
      await promise;

      expect(service.isLoggedIn()).toBeTrue();
      expect(themeServiceMock.setMode).toHaveBeenCalledWith(
        MOCK_USER.active_dark_light_mode,
      );
      expect(themeServiceMock.applyTheme).toHaveBeenCalledWith(
        MOCK_USER.active_theme,
      );
    });

    it('should clear auth if /users/me returns error', async () => {
      service.login('testuser', 'Password1').subscribe();
      httpMock.expectOne(`${BASE}/users/login`).flush(MOCK_LOGIN_RESPONSE);

      const promise = service.loadUserFromToken();
      httpMock
        .expectOne(`${BASE}/users/me`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      await promise;

      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  // ── updateCurrentUser ─────────────────────────────────────────────────────
  describe('updateCurrentUser', () => {
    it('should emit updated user via currentUser$', (done) => {
      const updatedUser = { ...MOCK_USER, username: 'updateduser' };
      let emitCount = 0;

      service.currentUser$.subscribe((user) => {
        emitCount++;
        if (emitCount === 2) {
          expect(user?.username).toBe('updateduser');
          done();
        }
      });

      service.updateCurrentUser(updatedUser);
    });
  });
});
