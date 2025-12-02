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
      const savedUser = localStorage.getItem('user_data');
      
      if (token) {
        if (savedUser) {
          try {
            this.currentUserSubject.next(JSON.parse(savedUser));
          } catch {
            this.loadUserFromToken(token);
          }
        } else {
          this.loadUserFromToken(token);
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${API_CONFIG.AUTH}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);
            
            // Construir objeto usuario desde la respuesta plana
            const user = {
              idUsuario: response.idUsuario,
              nombre: response.nombre,
              apellido: response.apellido,
              email: response.email,
              correo: response.email, // Compatibilidad
              nombreRol: response.rol,
              idRol: response.rol === 'ADMIN' ? 1 : (response.rol === 'EMPLEADO' ? 2 : 3) // Mapeo simple de ID
            };

            this.setCurrentUser(user);
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
      localStorage.removeItem('user_data');
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

  setCurrentUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
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

  getRole(): string | null {
    const user = this.currentUserValue;
    if (!user) return null;

    // Priorizar nombreRol si existe
    if (user.nombreRol) return user.nombreRol;
    
    // Verificar idRol (manejar string o number)
    const idRol = Number(user.idRol);
    if (idRol === 1) return 'ADMIN';
    if (idRol === 2) return 'EMPLEADO';
    if (idRol === 3) return 'CLIENTE';

    // Verificar authorities (Spring Security standard)
    if (user.authorities) {
      if (typeof user.authorities === 'string') return user.authorities;
      if (Array.isArray(user.authorities)) {
        const roleAuth = user.authorities.find((a: any) => 
          typeof a === 'string' ? a.includes('ADMIN') || a.includes('EMPLEADO') || a.includes('CLIENTE') :
          a.authority?.includes('ADMIN') || a.authority?.includes('EMPLEADO') || a.authority?.includes('CLIENTE')
        );
        if (roleAuth) {
          const authString = typeof roleAuth === 'string' ? roleAuth : roleAuth.authority;
          if (authString.includes('ADMIN')) return 'ADMIN';
          if (authString.includes('EMPLEADO')) return 'EMPLEADO';
          if (authString.includes('CLIENTE')) return 'CLIENTE';
        }
      }
    }

    return null;
  }
}
