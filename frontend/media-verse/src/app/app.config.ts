import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './preset1';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { MessageService } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { rateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { globalErrorInterceptor } from './interceptors/global-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
    ),
    provideHttpClient(
      withInterceptors([
        rateLimitInterceptor,
        authInterceptor,
        globalErrorInterceptor,
      ]),
    ),
    MessageService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.p-dark',
        },
      },
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const themeService = inject(ThemeService);
      themeService.init();
      return authService.loadUserFromToken();
    }),
  ],
};
