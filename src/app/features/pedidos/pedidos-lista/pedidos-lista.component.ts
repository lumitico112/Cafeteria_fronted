import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
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
    private authService: AuthService
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
      error: () => this.isLoading = false
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

  updateEstado(pedido: Pedido, nuevoEstado: string) {
    if (confirm(`¿Cambiar estado del pedido #${pedido.idPedido} a ${nuevoEstado}?`)) {
      this.pedidosService.updateEstado(pedido.idPedido, nuevoEstado).subscribe({
        next: () => this.loadPedidos(),
        error: () => alert('Error al actualizar estado')
      });
    }
  }
}
