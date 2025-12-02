import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriasService } from '../categorias.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.css']
})
export class CategoriaFormComponent implements OnInit {
  @Input() isModal = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  categoriaForm: FormGroup;
  isEditing = false;
  isLoading = false;
  categoriaId?: number;

  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: ['ACTIVO']
    });
  }

  ngOnInit() {
    if (!this.isModal) {
      this.categoriaId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.categoriaId) {
        this.isEditing = true;
        this.loadCategoria(this.categoriaId);
      }
    }
  }

  loadCategoria(id: number) {
    this.isLoading = true;
    this.categoriasService.getById(id).subscribe({
      next: (data) => {
        this.categoriaForm.patchValue(data);
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Error al cargar categoría');
        if (!this.isModal) this.router.navigate(['/categorias']);
        else this.onCancel.emit();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.categoriaForm.valid) {
      this.isLoading = true;
      const data = this.categoriaForm.value;
      
      const request = this.isEditing && this.categoriaId
        ? this.categoriasService.update(this.categoriaId, data)
        : this.categoriasService.create(data);

      request.subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente'
          );
          if (this.isModal) {
            this.onSave.emit();
            this.categoriaForm.reset({ estado: 'ACTIVO' });
            this.isLoading = false;
          } else {
            this.router.navigate(['/categorias']);
          }
        },
        error: () => {
          this.notificationService.error('Error al guardar categoría');
          this.isLoading = false;
        }
      });
    } else {
      this.categoriaForm.markAllAsTouched();
      this.notificationService.info('Por favor complete los campos requeridos');
    }
  }

  cancel() {
    if (this.isModal) {
      this.onCancel.emit();
    } else {
      this.router.navigate(['/categorias']);
    }
  }
}
