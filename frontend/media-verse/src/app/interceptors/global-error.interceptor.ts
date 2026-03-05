import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const handledErrors = new WeakSet<HttpErrorResponse>();

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (handledErrors.has(err)) return throwError(() => err);
      handledErrors.add(err);

      let errorHandledByInterceptor = false;

      if (err.status === 401 && err.error?.code === 'WALLET_EXPIRED') {
        authService.loadUserFromToken();
        notificationService.warn(
          'Wallet expired. Please connect your wallet again.',
        );
        router.navigate(['/']);
        errorHandledByInterceptor = true;

        (err as any).handledByInterceptor = errorHandledByInterceptor;

        return throwError(() => err);
      }

      if ([400, 401, 409, 422, 429].includes(err.status)) {
        return throwError(() => err);
      }

      if (err.status === 403) {
        notificationService.error(err.error?.error ?? 'No permission');
        router.navigate(['/']);
        errorHandledByInterceptor = true;
      }

      if (err.status === 404) {
        notificationService.error(err.error?.error ?? 'Not found');
        errorHandledByInterceptor = true;
      }

      if (err.status === 0) {
        notificationService.error('Cannot connect to server.');
        errorHandledByInterceptor = true;
      }

      if (err.status >= 500) {
        notificationService.error(err.error?.error ?? 'Server error');
        errorHandledByInterceptor = true;
      }

      (err as any).handledByInterceptor = errorHandledByInterceptor;

      return throwError(() => err);
    }),
  );
};
