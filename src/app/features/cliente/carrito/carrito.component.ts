import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CarritoService, CartItem } from '../../../core/services/carrito.service';
import { PedidosService } from '../../pedidos/pedidos.service';
import { AuthService } from '../../../core/services/auth.service';
import { PedidoCreate } from '../../../core/models/pedido.model';
import { API_CONFIG } from '../../../core/constants';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice = 0;

  constructor(
    private carritoService: CarritoService,
    private pedidosService: PedidosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carritoService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.carritoService.totalPrice;
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.cantidad + change;
    if (newQuantity > 0) {
      this.carritoService.updateQuantity(item.producto.idProducto, newQuantity);
    }
  }

  removeItem(item: CartItem) {
    this.carritoService.removeFromCart(item.producto.idProducto);
  }

  checkout() {
    const user = this.authService.currentUserValue;
    if (!user || !user.idUsuario) {
      alert('Debes iniciar sesión para realizar un pedido');
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const pedido: PedidoCreate = {
      idUsuario: user.idUsuario,
      tipoEntrega: 'LOCAL', // Por defecto, podría ser seleccionable
      detalles: this.cartItems.map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad
      }))
    };

    if (confirm('¿Estás seguro de procesar el pedido?')) {
      this.pedidosService.create(pedido).subscribe({
        next: (res) => {
          alert('¡Pedido realizado con éxito! ID: ' + res.idPedido);
          this.carritoService.clearCart();
          this.router.navigate(['/catalogo']); // O historial de pedidos si existiera
        },
        error: (err) => {
          console.error('Error creating order', err);
          alert('Error al procesar el pedido. Intente nuevamente.');
        }
      });
    }
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.UPLOADS}/${url}`;
  }
}
