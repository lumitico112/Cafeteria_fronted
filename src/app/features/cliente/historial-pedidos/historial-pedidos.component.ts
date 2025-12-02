import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../pedidos/pedidos.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Pedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-pedidos.component.html',
  styleUrls: ['./historial-pedidos.component.css']
})
export class HistorialPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;

  constructor(
    private pedidosService: PedidosService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadPedidos();
  }

  loadPedidos() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.pedidosService.misPedidos().subscribe({
        next: (data) => {
          this.pedidos = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders', err);
          this.notificationService.error('Error al cargar el historial de pedidos');
          this.loading = false;
        }
      });
    }
  }

  async confirmarEntrega(pedido: Pedido) {
    const confirmed = await this.notificationService.confirm('¿Confirmas que has recibido tu pedido?', 'Sí, confirmar');
    if (confirmed) {
      this.pedidosService.updateEstado(pedido.idPedido, 'ENTREGADO').subscribe({
        next: () => {
          this.notificationService.success('¡Gracias por confirmar! Que disfrutes tu pedido.');
          this.loadPedidos();
        },
        error: (err) => {
          console.error('Error updating status', err);
          this.notificationService.error('Error al actualizar el estado.');
        }
      });
    }
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-secondary';
      case 'PREPARACION': return 'bg-warning text-dark';
      case 'LISTO': return 'bg-info text-dark';
      case 'EN_CAMINO': return 'bg-primary';
      case 'ENTREGADO': return 'bg-success';
      case 'CANCELADO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
