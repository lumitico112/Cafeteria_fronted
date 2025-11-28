import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriasService } from '../categorias.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-categorias-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.css']
})
export class CategoriasListaComponent implements OnInit {
  categorias: Categoria[] = [];
  isLoading = true;

  constructor(private categoriasService: CategoriasService) {}

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
      error: () => this.isLoading = false
    });
  }

  deleteCategoria(cat: Categoria) {
    if (confirm(`¿Está seguro de eliminar la categoría "${cat.nombre}"?`)) {
      this.categoriasService.delete(cat.idCategoria).subscribe({
        next: () => this.loadCategorias(),
        error: () => alert('Error al eliminar categoría')
      });
    }
  }
}
