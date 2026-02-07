import { HttpErrorResponse } from '@angular/common/http';

export function shouldHandleError(err: HttpErrorResponse): boolean {
  return !(err as any).handledByInterceptor;
}
