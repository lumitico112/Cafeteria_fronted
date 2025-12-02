import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Pedido } from '../../../core/models/pedido.model';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.css']
})
export class PedidosListaComponent implements OnInit {
  pedidos: Pedido[] = [];
  filteredPedidos: Pedido[] = [];
  isLoading = true;
  selectedEstado = '';
  isAdmin = false;

  constructor(
    private pedidosService: PedidosService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.loadPedidos();
  }

  loadPedidos() {
    this.isLoading = true;
    this.pedidosService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.filterByEstado(this.selectedEstado);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.notificationService.error('Error al cargar pedidos');
        this.isLoading = false;
      }
    });
  }

  filterByEstado(estado: string) {
    this.selectedEstado = estado;
    if (estado) {
      this.filteredPedidos = this.pedidos.filter(p => p.estado === estado);
    } else {
      this.filteredPedidos = this.pedidos;
    }
  }

  async updateEstado(pedido: Pedido, nuevoEstado: string) {
    const confirmed = await this.notificationService.confirm(
      `¿Cambiar estado del pedido #${pedido.idPedido} a ${nuevoEstado}?`,
      'Sí, cambiar'
    );

    if (confirmed) {
      this.pedidosService.updateEstado(pedido.idPedido, nuevoEstado).subscribe({
        next: () => {
          this.notificationService.success(`Estado actualizado a ${nuevoEstado}`);
          this.loadPedidos();
        },
        error: (err) => {
          console.error('Error updating order status', err);
          this.notificationService.error('Error al actualizar estado');
        }
      });
    }
  }
}
