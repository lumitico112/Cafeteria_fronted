import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../models/producto.model';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItems.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems.next(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
        }
      }
    }
  }

  addToCart(producto: Producto, cantidad: number = 1) {
    const currentCart = this.cartItems.value;
    const existingItem = currentCart.find(item => item.producto.idProducto === producto.idProducto);

    if (existingItem) {
      existingItem.cantidad += cantidad;
      this.cartItems.next([...currentCart]);
    } else {
      this.cartItems.next([...currentCart, { producto, cantidad }]);
    }
    this.saveCart();
  }

  removeFromCart(productoId: number) {
    const currentCart = this.cartItems.value.filter(item => item.producto.idProducto !== productoId);
    this.cartItems.next(currentCart);
    this.saveCart();
  }

  updateQuantity(productoId: number, cantidad: number) {
    const currentCart = this.cartItems.value;
    const item = currentCart.find(i => i.producto.idProducto === productoId);
    if (item) {
      item.cantidad = cantidad;
      if (item.cantidad <= 0) {
        this.removeFromCart(productoId);
        return;
      }
      this.cartItems.next([...currentCart]);
      this.saveCart();
    }
  }

  clearCart() {
    this.cartItems.next([]);
    this.saveCart();
  }

  private saveCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    }
  }
  
  get totalItems() {
    return this.cartItems.value.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get totalPrice() {
    return this.cartItems.value.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }
}
