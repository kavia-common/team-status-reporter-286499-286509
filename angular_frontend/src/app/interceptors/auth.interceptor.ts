import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.token;

  let cloned = req;
  if (token && !req.headers.has('Authorization')) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  } else {
    cloned = req.clone({ withCredentials: true });
  }

  return next(cloned).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Try refresh once
        return auth.refresh().pipe(
          switchMap((ok) => {
            if (ok) {
              const newToken = auth.token;
              const retryReq = req.clone({
                setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {},
                withCredentials: true
              });
              return next(retryReq);
            }
            // Redirect to login if refresh fails
            auth.setToken(null);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
