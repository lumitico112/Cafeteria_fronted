import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UsuarioCreate } from '../models/usuario.model';

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api';
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
      const token = this.getToken();
      if (token) {
        this.loadUserFromToken(token);
      }
    }
  }

  login(correo: string, contrasena: string): Observable<AuthResponse> {
    const payload = { email: correo, password: contrasena };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            this.loadUserFromToken(response.token);
          }
        })
      );
  }

  register(userData: UsuarioCreate): Observable<AuthResponse> {
    const payload = {
      firstname: userData.nombre,
      lastname: userData.apellido,
      email: userData.correo,
      password: userData.contrasena,
      idRol: userData.idRol,
      telefono: userData.telefono,
      direccion: userData.direccion
    };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload)
      .pipe(
        tap((response) => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            this.loadUserFromToken(response.token);
          }
        })
      );
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
