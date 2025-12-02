import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriasService } from '../categorias.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaFormComponent } from '../categoria-form/categoria-form.component';

@Component({
  selector: 'app-categorias-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, CategoriaFormComponent],
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.css']
})
export class CategoriasListaComponent implements OnInit {
  categorias: Categoria[] = [];
  isLoading = true;
  showModal = false;

  constructor(
    private categoriasService: CategoriasService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.isLoading = true;
    this.categoriasService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.notificationService.error('Error al cargar categorías');
        this.isLoading = false;
      }
    });
  }

  async deleteCategoria(cat: Categoria) {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de eliminar la categoría "${cat.nombre}"?`,
      'Sí, eliminar'
    );

    if (confirmed) {
      this.categoriasService.delete(cat.idCategoria).subscribe({
        next: () => {
          this.notificationService.success('Categoría eliminada correctamente');
          this.loadCategorias();
        },
        error: (err) => {
          console.error('Error deleting category', err);
          this.notificationService.error('Error al eliminar categoría');
        }
      });
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onCategoriaSaved() {
    this.closeModal();
    this.loadCategorias();
  }
}
