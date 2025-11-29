import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { LoginRequest } from '../../../core/models/auth.models';
import { ROLES } from '../../../core/constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { correo, contrasena } = this.loginForm.value;
      const credentials: LoginRequest = {
        email: correo,
        password: contrasena
      };
      
      this.authService.login(credentials).subscribe({
        next: () => {
          // Como el token no trae el rol, buscamos el usuario por su correo
          this.usuariosService.getAll().subscribe({
            next: (users) => {
              const currentUser = users.find(u => u.correo === correo);
              
              if (currentUser) {
                // Actualizamos el usuario en el AuthService con la info completa (incluyendo rol)
                this.authService.setCurrentUser(currentUser);
                
                // Ahora sí verificamos el rol
                const role = this.authService.getRole();

                if (role === 'ADMIN' || role === 'EMPLEADO') {
                  this.router.navigate(['/dashboard']);
                } else {
                  this.router.navigate(['/']);
                }
              } else {
                // Fallback si no encontramos el usuario (raro si hizo login)
                this.router.navigate(['/']);
              }
            },
            error: (err) => {
              // Si es 403 (Forbidden), es esperado para clientes que no pueden listar usuarios.
              // No lo tratamos como un error crítico en consola.
              if (err.status !== 403) {
                console.error('Error al obtener detalles del usuario', err);
              }
              
              // Construimos un usuario fallback
              // Usamos la parte del correo antes del @ como nombre provisional
              const nombreProvisional = correo.split('@')[0];
              
              const fallbackUser = {
                correo: correo,
                nombre: nombreProvisional, 
                idRol: 3, // Asumimos Cliente
                nombreRol: 'CLIENTE',
                sub: correo // Para compatibilidad
              };
              
              this.authService.setCurrentUser(fallbackUser);
              this.router.navigate(['/']); 
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
