import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService, CartItem } from '../../../core/services/carrito.service';
import { PedidosService } from '../../pedidos/pedidos.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoCreate } from '../../../core/models/pedido.model';
import { API_CONFIG } from '../../../core/constants';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  isAdminOrEmployee = false;

  constructor(
    private carritoService: CarritoService,
    private pedidosService: PedidosService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carritoService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.carritoService.totalPrice;
    });
    const role = this.authService.getRole();
    this.isAdminOrEmployee = role === 'ADMIN' || role === 'EMPLEADO';
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.cantidad + change;
    if (newQuantity > 0) {
      this.carritoService.updateQuantity(item.producto.idProducto, newQuantity);
    }
  }

  removeItem(item: CartItem) {
    this.carritoService.removeFromCart(item.producto.idProducto);
    this.notificationService.toast('Producto eliminado', 'info');
  }

  // Checkout Modal State
  showModal = false;
  deliveryType: 'DELIVERY' | 'RETIRO' | 'LOCAL' = 'DELIVERY';
  deliveryAddress = '';
  pickupTime = '';
  estimatedTime = '30-45 min';
  
  // Payment State
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' = 'EFECTIVO';
  
  // Employee POS State
  clientName = ''; // For walk-in clients (Employee mode)
  posType: 'LOCAL' | 'LLEVAR' = 'LOCAL'; // Sub-type for POS

  // Success State
  orderSuccess = false;
  lastOrderId?: number;
  lastOrderItems: CartItem[] = []; // Backup for receipt
  lastOrderTotal = 0;
  lastOrderClientName = '';
  lastOrderType = ''; // To store the specific type for receipt

  checkout() {
    const user = this.authService.currentUserValue;
    if (!user || !user.idUsuario) {
      this.notificationService.warning('Debes iniciar sesión para realizar un pedido');
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) {
      this.notificationService.warning('El carrito está vacío');
      return;
    }

    // Default settings
    if (this.isAdminOrEmployee) {
      this.deliveryType = 'LOCAL'; // Default for POS
      this.posType = 'LOCAL';
    } else {
      this.deliveryType = 'DELIVERY';
      // Pre-fill address if available (mock)
      // this.deliveryAddress = user.direccion || ''; 
    }
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.orderSuccess = false;
  }

  confirmOrder() {
    const user = this.authService.currentUserValue;
    
    // Validations
    if (this.deliveryType === 'DELIVERY' && !this.deliveryAddress) {
      this.notificationService.error('Por favor ingrese la dirección de entrega', 'Faltan datos');
      return;
    }

    if (this.deliveryType === 'RETIRO' && !this.pickupTime) {
      this.notificationService.error('Por favor seleccione la hora de recojo', 'Faltan datos');
      return;
    }

    // Prepare Client Name for POS
    let finalClientName = this.clientName;
    if (this.isAdminOrEmployee && this.deliveryType === 'LOCAL') {
      if (this.posType === 'LLEVAR') {
         finalClientName = (finalClientName ? finalClientName : 'Cliente') + ' (PARA LLEVAR)';
      }
    }

    // Format pickup time to ISO 8601 (YYYY-MM-DDTHH:mm:ss)
    let formattedPickupTime: string | undefined;
    if (this.deliveryType === 'RETIRO' && this.pickupTime) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      // pickupTime is usually HH:mm, we add :00 for seconds
      formattedPickupTime = `${year}-${month}-${day}T${this.pickupTime}:00`;
    }

    const pedido: PedidoCreate = {
      idUsuario: user.idUsuario, // If Employee, this is Employee's ID (acting as creator)
      tipoEntrega: this.deliveryType,
      direccionEntrega: this.deliveryType === 'DELIVERY' ? this.deliveryAddress : undefined,
      fechaRecojo: formattedPickupTime,
      detalles: this.cartItems.map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad
      }))
    };
    
    // Backup data for receipt BEFORE clearing cart
    this.lastOrderItems = [...this.cartItems];
    this.lastOrderTotal = this.totalPrice;
    this.lastOrderClientName = finalClientName || user.nombre + ' ' + user.apellido;
    this.lastOrderType = this.deliveryType === 'LOCAL' ? this.posType : this.deliveryType;

    // Simulate payment process
    setTimeout(() => {
      this.pedidosService.create(pedido).subscribe({
        next: (res) => {
          this.lastOrderId = res.idPedido;
          this.orderSuccess = true;
          this.carritoService.clearCart();
          this.notificationService.success('¡Pedido registrado correctamente!');
          // Reset form
          this.clientName = '';
          this.deliveryAddress = '';
          this.pickupTime = '';
        },
        error: (err) => {
          console.error('Error creating order', err);
          let errorMessage = 'Error al procesar el pedido. Intente nuevamente.';
          
          if (err.error) {
            const backendMsg = typeof err.error === 'string' ? err.error : err.error.message;
            
            if (backendMsg) {
              // Check for specific known errors
              if (backendMsg.includes('Stock insuficiente')) {
                errorMessage = 'No hay suficiente stock para completar el pedido de uno o más productos.';
              } else if (backendMsg.includes('could not execute statement')) {
                // Try to extract the message inside the first brackets if it looks like a business rule
                const match = backendMsg.match(/\[(.*?)\]/);
                if (match && match[1]) {
                  errorMessage = match[1];
                } else {
                  errorMessage = 'Error interno del servidor al procesar el pedido.';
                }
              } else {
                errorMessage = backendMsg;
              }
            }
          }
          
          this.notificationService.error(errorMessage);
        }
      });
    }, 1500);
  }

  downloadReceipt() {
    if (!this.lastOrderId) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Helper to center text
    const centerText = (text: string, y: number) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    centerText('CAFETERÍA EL AROMA', 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    centerText('RUC: 20123456789', 28);
    centerText('Av. Principal 123, Lima', 34);
    
    doc.line(10, 40, pageWidth - 10, 40);

    // Order Info
    doc.setFontSize(10);
    doc.text(`Pedido ID: #${this.lastOrderId}`, 15, 50);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 15, 56);
    doc.text(`Cliente: ${this.lastOrderClientName}`, 15, 62);
    
    let tipoEntregaDisplay = this.lastOrderType;
    if (this.lastOrderType === 'LLEVAR') tipoEntregaDisplay = 'PARA LLEVAR';
    
    doc.text(`Tipo Entrega: ${tipoEntregaDisplay}`, 15, 68);
    doc.text(`Método Pago: ${this.paymentMethod}`, 15, 74);
    
    if (this.deliveryType === 'DELIVERY') {
      doc.text(`Dirección: ${this.deliveryAddress}`, 15, 80);
    } else if (this.deliveryType === 'RETIRO') {
      doc.text(`Hora Recojo: ${this.pickupTime}`, 15, 80);
    }

    doc.line(10, 85, pageWidth - 10, 85);

    // Items Header
    let y = 95;
    doc.setFont('helvetica', 'bold');
    doc.text('Cant.', 15, y);
    doc.text('Producto', 35, y);
    doc.text('P.Unit', 140, y, { align: 'right' });
    doc.text('Total', 190, y, { align: 'right' });
    
    y += 5;
    doc.line(10, y, pageWidth - 10, y);
    y += 10;

    // Items List
    doc.setFont('helvetica', 'normal');
    this.lastOrderItems.forEach(item => {
      doc.text(item.cantidad.toString(), 15, y);
      
      // Handle long product names
      const splitTitle = doc.splitTextToSize(item.producto.nombre, 90);
      doc.text(splitTitle, 35, y);
      
      doc.text(`S/ ${item.producto.precio.toFixed(2)}`, 140, y, { align: 'right' });
      doc.text(`S/ ${(item.producto.precio * item.cantidad).toFixed(2)}`, 190, y, { align: 'right' });
      
      y += (splitTitle.length * 7); // Adjust spacing based on lines
    });

    doc.line(10, y, pageWidth - 10, y);
    y += 10;

    // Totals
    const total = this.lastOrderTotal;
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    doc.text('Subtotal:', 140, y, { align: 'right' });
    doc.text(`S/ ${subtotal.toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
    
    doc.text('IGV (18%):', 140, y, { align: 'right' });
    doc.text(`S/ ${igv.toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 140, y, { align: 'right' });
    doc.text(`S/ ${total.toFixed(2)}`, 190, y, { align: 'right' });

    // Footer
    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    centerText('¡Gracias por su preferencia!', y);
    
    // Save
    doc.save(`comprobante_pedido_${this.lastOrderId}.pdf`);
  }

  goToHistory() {
    this.router.navigate(['/historial']);
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.UPLOADS}/${url}`;
  }
}
