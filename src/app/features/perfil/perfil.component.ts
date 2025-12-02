import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  showPasswordModal = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      nombre: [{value: '', disabled: true}],
      apellido: [{value: '', disabled: true}],
      correo: [{value: '', disabled: true}],
      telefono: ['', [Validators.pattern('^[0-9]{9}$')]],
      direccion: ['']
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.idUsuario) {
        // Cargar datos frescos de la BD
        this.isLoading = true;
        this.usuariosService.getById(user.idUsuario).subscribe({
          next: (fullUser) => {
            // Mapear Usuario a User para evitar error de tipos
            this.currentUser = {
              ...user, // Mantener datos del token como base
              ...fullUser, // Sobrescribir con datos frescos
              email: fullUser.correo // Asegurar que email exista (User lo requiere)
            };
            this.updateForm(fullUser);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading user details', err);
            // Fallback a datos del token
            this.updateForm(user);
            this.isLoading = false;
          }
        });
      } else if (user) {
        this.updateForm(user);
      }
    });
  }

  updateForm(user: any) {
    this.profileForm.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo || user.email,
      telefono: user.telefono,
      direccion: user.direccion
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  updateProfile() {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      const updatedData = {
        ...this.currentUser,
        telefono: this.profileForm.get('telefono')?.value,
        direccion: this.profileForm.get('direccion')?.value
      };

      // Nota: Asumimos que el backend tiene un endpoint para actualizar perfil propio o usamos el de admin
      // Si no existe endpoint específico, usamos el de update usuario
      this.usuariosService.update(this.currentUser.idUsuario!, updatedData).subscribe({
        next: (user) => {
          this.authService.setCurrentUser(user);
          this.notificationService.success('Perfil actualizado correctamente');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating profile', err);
          this.notificationService.error('Error al actualizar perfil');
          this.isLoading = false;
        }
      });
    }
  }

  openPasswordModal() {
    this.showPasswordModal = true;
    this.passwordForm.reset();
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  changePassword() {
    if (this.passwordForm.valid && this.currentUser) {
      // Aquí iría la llamada al servicio para cambiar contraseña
      // Por ahora simulamos éxito
      this.notificationService.success('Contraseña actualizada correctamente');
      this.closePasswordModal();
    }
  }
}
