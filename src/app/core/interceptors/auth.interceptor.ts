import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  
  let token = null;
  
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('jwt_token');
  }
  
  let authReq = req;
  
  if (token) {
    // console.log('Interceptor: Attaching token to request', req.url); // Uncomment for verbose logging
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    // No mostramos advertencia para endpoints de autenticación (login/register)
    if (!req.url.includes('/auth')) {
      console.warn('Interceptor: No token found for request', req.url);
    }
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Interceptor: 401 Unauthorized detected for', req.url);
        // Token expirado o inválido
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_data');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
