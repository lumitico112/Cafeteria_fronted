import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../productos/productos.service';
import { CategoriasService } from '../../categorias/categorias.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { API_CONFIG } from '../../../core/constants';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = '';

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private carritoService: CarritoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;
    
    forkJoin({
      categorias: this.categoriasService.getAll().pipe(
        catchError(err => {
          console.error('Error loading categories', err);
          return of([]);
        })
      ),
      productos: this.productosService.getAll().pipe(
        catchError(err => {
          console.error('Error loading products', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        this.categorias = results.categorias;
        this.productos = results.productos;
        this.filteredProductos = results.productos;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data', err);
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

  addToCart(producto: Producto) {
    this.carritoService.addToCart(producto);
    // Opcional: Mostrar notificación toast
    alert('Producto agregado al carrito');
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.UPLOADS}/${url}`;
  }
}
