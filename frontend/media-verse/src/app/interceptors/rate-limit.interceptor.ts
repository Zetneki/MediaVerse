import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

const handledErrors = new WeakSet<HttpErrorResponse>();

export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 429 && !handledErrors.has(err)) {
        handledErrors.add(err);

        const errorMessage = err.error?.error ?? 'Rate limit exceeded';
        notificationService.error(errorMessage);

        (err as any).handledByInterceptor = true;
      }

      return throwError(() => err);
    }),
  );
};
