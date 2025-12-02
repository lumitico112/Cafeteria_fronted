import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService } from '../../productos/productos.service';
import { CategoriasService } from '../../categorias/categorias.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  cartItemCount = 0;

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private carritoService: CarritoService,
    private notificationService: NotificationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
      this.carritoService.cart$.subscribe(items => {
        this.cartItemCount = items.reduce((acc, item) => acc + item.cantidad, 0);
      });
    }
  }

  loadData() {
    this.isLoading = true;
    
    forkJoin({
      categorias: this.categoriasService.getAll().pipe(
        catchError(err => {
          console.error('Error loading categories', err);
          this.notificationService.error('Error al cargar categorías');
          return of([]);
        })
      ),
      productos: this.productosService.getAll().pipe(
        catchError(err => {
          console.error('Error loading products', err);
          this.notificationService.error('Error al cargar productos');
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
    this.notificationService.toast(`Agregado: ${producto.nombre}`, 'success');
  }

  goToCart() {
    this.router.navigate(['/carrito']);
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.UPLOADS}/${url}`;
  }
}
