import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from API
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { 
            returnUrl: router.url,
            error: 'Your session has expired. Please log in again.'
          }
        });
      }
      
      return throwError(() => error);
    })
  );
};