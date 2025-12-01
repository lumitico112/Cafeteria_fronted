import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductosService } from '../productos.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { FormsModule } from '@angular/forms';
import { ProductoFormComponent } from '../producto-form/producto-form.component';

import { CategoriasService } from '../../categorias/categorias.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductoFormComponent],
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.css']
})
export class ProductosListaComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = '';
  showModal = false;

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.getRole() === 'CLIENTE') {
        this.router.navigate(['/catalogo']);
        return;
      }
      this.loadProductos();
      this.loadCategorias();
    }
  }

  loadCategorias() {
    this.categoriasService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadProductos() {
    this.isLoading = true;
    this.productosService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.filteredProductos = data;
        this.isLoading = false;
        this.filterProducts(); // Re-apply filters if any
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(term) || 
                            (p.descripcion || '').toLowerCase().includes(term);
      const matchesCategory = this.selectedCategory ? p.idCategoria?.toString() === this.selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }

  deleteProducto(producto: Producto) {
    if (confirm(`¿Está seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.productosService.delete(producto.idProducto).subscribe({
        next: () => {
          this.loadProductos(); // Recargar lista
        },
        error: (err) => alert('Error al eliminar producto')
      });
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onProductSaved() {
    this.closeModal();
    this.loadProductos();
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080/uploads/${url}`;
  }
}
