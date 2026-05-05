import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Api } from '../services/api';

export const requireAuthGuard: CanActivateFn = () => {
  const apiService = inject(Api);
  const router = inject(Router);

  return apiService.me().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
