import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const token = parsedUser?.accessToken;
  const refreshToken = parsedUser?.refreshToken;

  const excludedUrls = ['/login', '/signin', '/register'];
  const isExcluded = excludedUrls.some((path) => req.url.includes(path));

  // ✅ If excluded route or no token, send request as-is
  if (isExcluded || !token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error) => {
      // ✅ Only attempt refresh if 401 and refresh token is available
      if (error.status === 401 && !isRefreshing && refreshToken) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;

            const currentUser = authService.getCurrentUser();
            const updatedUser = {
              ...currentUser,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.data.accessToken}`,
              },
              withCredentials: true,
            });

            return next(retryReq);
          }),
          catchError((err) => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/signin']);
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
