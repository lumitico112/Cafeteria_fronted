import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
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
      
      this.authService.login(correo, contrasena).subscribe({
        next: () => {
          const user = this.authService.currentUserValue;
          // Verificar por ID (3) o por nombre ('CLIENTE')
          // El payload del token puede variar, así que comprobamos varias posibilidades
          const isCliente = (user?.idRol === 3) || 
                            (user?.nombreRol === 'CLIENTE') || 
                            (user?.rol?.nombre === 'CLIENTE') ||
                            (user?.authorities?.includes('CLIENTE')) ||
                            (user?.authorities?.includes('ROLE_CLIENTE'));

          if (isCliente) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/dashboard']);
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
