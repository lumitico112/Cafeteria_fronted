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
          // El token ya fue procesado por AuthService
          const role = this.authService.getRole();
          const user = this.authService.currentUserValue;

          // Si tenemos ID, intentamos cargar datos frescos (opcional, pero bueno para el perfil)
          if (user && user.idUsuario) {
             // No bloqueamos la redirección por esto, lo hacemos en background o dejamos que PerfilComponent lo haga
          }

          if (role === 'ADMIN' || role === 'EMPLEADO') {
            this.router.navigate(['/dashboard']);
          } else {
            // Asumimos CLIENTE por defecto o si es explícito
            this.router.navigate(['/']);
          }
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
