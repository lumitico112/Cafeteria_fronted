import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../models/auth.models';
import { API_CONFIG } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Cargar usuario desde localStorage al iniciar solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        this.loadUserFromToken(token);
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${API_CONFIG.AUTH}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            this.loadUserFromToken(response.token);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${API_CONFIG.AUTH}/register`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(token: string): void {
    try {
      // Decodificar JWT para obtener información del usuario
      // Nota: En un entorno real usar una librería como jwt-decode
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserSubject.next(payload);
    } catch (e) {
      console.error('Error decoding token', e);
      this.logout();
    }
  }
}
