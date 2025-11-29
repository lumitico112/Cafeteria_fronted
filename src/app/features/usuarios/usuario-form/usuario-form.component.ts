import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../usuarios.service';
import { ROLES } from '../../../core/constants';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  @Input() isModal = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  usuarioForm: FormGroup;
  isEditing = false;
  isLoading = false;
  usuarioId?: number;
  roles = [
    { id: ROLES.ADMIN, nombre: 'Administrador' },
    { id: ROLES.EMPLEADO, nombre: 'Empleado' },
    { id: ROLES.CLIENTE, nombre: 'Cliente' }
  ];
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      idRol: [ROLES.EMPLEADO, Validators.required],
      telefono: [''],
      direccion: [''],
      estado: ['ACTIVO']
    });
  }

  ngOnInit() {
    if (!this.isModal) {
      this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.usuarioId) {
        this.isEditing = true;
        this.loadUsuario(this.usuarioId);
      }
    }
  }

  loadUsuario(id: number) {
    this.isLoading = true;
    this.usuariosService.getById(id).subscribe({
      next: (data) => {
        // Mapeo de campos para asegurar que se muestren en el formulario
        const formData = {
          ...data,
          telefono: data.telefono || data.phone,
          direccion: data.direccion || data.address
        };
        
        this.usuarioForm.patchValue(formData);
        // La contraseña no se devuelve por seguridad, así que quitamos la validación requerida al editar
        this.usuarioForm.get('contrasena')?.clearValidators();
        this.usuarioForm.get('contrasena')?.updateValueAndValidity();
        this.isLoading = false;
      },
      error: () => {
        alert('Error al cargar usuario');
        if (!this.isModal) this.router.navigate(['/usuarios']);
        else this.onCancel.emit();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      const formValue = this.usuarioForm.value;
      
      // Mapeo simple: el backend ya acepta telefono y direccion
      const data = {
        ...formValue,
        telefono: formValue.telefono,
        direccion: formValue.direccion
      };
      
      const request = this.isEditing && this.usuarioId
        ? this.usuariosService.update(this.usuarioId, data)
        : this.usuariosService.create(data);

      request.subscribe({
        next: () => {
          if (this.isModal) {
            this.onSave.emit();
            this.usuarioForm.reset({ idRol: ROLES.EMPLEADO, estado: 'ACTIVO' });
            this.isLoading = false;
          } else {
            this.router.navigate(['/usuarios']);
          }
        },
        error: () => {
          alert('Error al guardar usuario');
          this.isLoading = false;
        }
      });
    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }

  cancel() {
    if (this.isModal) {
      this.onCancel.emit();
    } else {
      this.router.navigate(['/usuarios']);
    }
  }
}
