import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Api } from '../services/api';

export const authGuard: CanActivateFn = (route) => {
  const apiService = inject(Api);
  const router = inject(Router);
  const isLoginPage = route.routeConfig?.path === 'login';

  return apiService.me().pipe(
    map(() => isLoginPage ? router.createUrlTree(['/dashboard']) : true),
    catchError(() => of(isLoginPage ? true : router.createUrlTree(['/login']))),
  );
};
