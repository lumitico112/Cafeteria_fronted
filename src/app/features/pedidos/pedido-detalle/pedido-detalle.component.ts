import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Pedido } from '../../../core/models/pedido.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {
  pedido?: Pedido;
  isLoading = true;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private pedidosService: PedidosService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPedido(id);
    }
  }

  loadPedido(id: number) {
    this.isLoading = true;
    this.pedidosService.getById(id).subscribe({
      next: (data) => {
        this.pedido = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading order', err);
        this.isLoading = false;
      }
    });
  }

  updateEstado(nuevoEstado: string) {
    if (!this.pedido) return;

    this.pedidosService.updateEstado(this.pedido.idPedido, nuevoEstado).subscribe({
      next: () => {
        this.loadPedido(this.pedido!.idPedido);
        this.notificationService.success(`Estado actualizado a ${nuevoEstado}`);
      },
      error: () => this.notificationService.error('Error al actualizar estado')
    });
  }
}
