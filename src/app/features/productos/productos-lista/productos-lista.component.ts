import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../productos.service';
import { Producto } from '../../../core/models/producto.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.css']
})
export class ProductosListaComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = '';

  constructor(private productosService: ProductosService) {}

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.isLoading = true;
    this.productosService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.filteredProductos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    this.filteredProductos = this.productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            p.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory ? p.idCategoria.toString() === this.selectedCategory : true;
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
}
