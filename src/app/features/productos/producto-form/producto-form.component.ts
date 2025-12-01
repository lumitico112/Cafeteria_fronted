import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService } from '../productos.service';
import { CategoriasService } from '../../categorias/categorias.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit {
  @Input() isModal = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  productoForm: FormGroup;
  isEditing = false;
  isLoading = false;
  productId?: number;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      impuesto: [0.18],
      idCategoria: ['', Validators.required],
      estado: ['ACTIVO'],
      imagenUrl: ['']
    });
  }

  ngOnInit() {
    this.loadCategorias();
    // Only check route params if NOT in modal mode
    if (!this.isModal) {
      this.productId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.productId) {
        this.isEditing = true;
        this.loadProduct(this.productId);
      }
    }
  }

  loadCategorias() {
    this.categoriasService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
      }
    });
  }

  loadProduct(id: number) {
    this.isLoading = true;
    this.productosService.getById(id).subscribe({
      next: (producto) => {
        this.productoForm.patchValue(producto);
        this.previewUrl = this.getImageUrl(producto.imagenUrl);
        this.isLoading = false;
      },
      error: () => {
        alert('Error al cargar producto');
        if (!this.isModal) this.router.navigate(['/productos']);
        else this.onCancel.emit();
      }
    });
  }

  getImageUrl(url: string | undefined | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080/uploads/${url}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlChange(event: any) {
    const url = event.target.value;
    if (url) {
      this.previewUrl = null; // Limpiar preview de archivo si se escribe URL
      this.selectedFile = null; // Limpiar archivo seleccionado
    }
  }

  onSubmit() {
    if (this.productoForm.valid) {
      this.isLoading = true;
      
      // Si hay archivo, subirlo primero
      if (this.selectedFile) {
        this.productosService.uploadImage(this.selectedFile).subscribe({
          next: (response) => {
            // Asumimos que response.url contiene la URL de la imagen subida
            // Ajustar según la respuesta real del backend
            this.productoForm.patchValue({ imagenUrl: response.filename || response.url });
            this.saveProduct();
          },
          error: () => {
            alert('Error al subir imagen');
            this.isLoading = false;
          }
        });
      } else {
        this.saveProduct();
      }
    } else {
      this.productoForm.markAllAsTouched();
    }
  }

  saveProduct() {
    const productData = this.productoForm.value;
    
    const request = this.isEditing && this.productId
      ? this.productosService.update(this.productId, productData)
      : this.productosService.create(productData);

    request.subscribe({
      next: () => {
        if (this.isModal) {
          this.onSave.emit();
          this.productoForm.reset(); // Reset form for next use
          this.previewUrl = null;
          this.selectedFile = null;
          this.isLoading = false;
        } else {
          this.router.navigate(['/productos']);
        }
      },
      error: (err) => {
        alert('Error al guardar producto');
        this.isLoading = false;
      }
    });
  }

  cancel() {
    if (this.isModal) {
      this.onCancel.emit();
    } else {
      this.router.navigate(['/productos']);
    }
  }
}
