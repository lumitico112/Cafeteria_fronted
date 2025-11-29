import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.models';
import { ROLES } from '../../../core/constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required],
      telefono: [''],
      direccion: [''],
      idRol: [3] // Por defecto CLIENTE
    }, { validators: this.passwordMatchValidator });
  }

  // Variables para la visibilidad de contraseñas
  showPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('contrasena')?.value === g.get('confirmarContrasena')?.value
       ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    // Para confirmarContrasena, también verificamos el error de mismatch en el grupo
    if (fieldName === 'confirmarContrasena') {
      return (!!(field && field.touched) && this.registerForm.hasError('mismatch'));
    }
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.registerForm.value;
      const registerData: RegisterRequest = {
        firstname: formValue.nombre,
        lastname: formValue.apellido,
        email: formValue.correo,
        password: formValue.contrasena,
        phone: formValue.telefono,
        address: formValue.direccion
      };
      
      this.authService.register(registerData).subscribe({
        next: () => {
          // Redirigir al login después del registro exitoso
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al registrarse. Intente nuevamente.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
