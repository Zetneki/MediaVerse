import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AUTH_ENDPOINTS } from '../utils/auth-endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (AUTH_ENDPOINTS.some((url) => req.url.includes(url))) {
    return next(req.clone({ withCredentials: true }));
  }

  const token = authService.getAccessToken();
  let modifiedReq = req;
  let hadToken = false;

  if (token) {
    hadToken = true;
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/users/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            if (
              req.url.includes('/users/refresh') ||
              refreshError.status === 401
            ) {
              authService.clearAuth();

              if (hadToken) {
                router.navigate(['/login']);
              }
            }
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
