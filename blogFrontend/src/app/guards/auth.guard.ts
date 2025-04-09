import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    tap(isAuthenticated => console.log('Auth guard check:', isAuthenticated)),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Store the attempted URL for redirecting after login
        const returnUrl = state.url;
        console.log('Not authenticated, redirecting to login. Return URL:', returnUrl);
        
        // Store the return URL before navigating
        if (returnUrl && returnUrl !== '/auth/login') {
          localStorage.setItem('returnUrl', returnUrl);
        }
        
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};