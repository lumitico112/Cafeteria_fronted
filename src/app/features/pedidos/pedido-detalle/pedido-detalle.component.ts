import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
import { Pedido } from '../../../core/models/pedido.model';

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

  constructor(
    private route: ActivatedRoute,
    private pedidosService: PedidosService
  ) {}

  ngOnInit() {
    this.loadPedido();
  }

  loadPedido() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isLoading = true;
      this.pedidosService.getById(id).subscribe({
        next: (data) => {
          this.pedido = data;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  updateEstado(nuevoEstado: string) {
    if (this.pedido && confirm(`¿Cambiar estado a ${nuevoEstado}?`)) {
      this.pedidosService.updateEstado(this.pedido.idPedido, nuevoEstado).subscribe({
        next: () => this.loadPedido(),
        error: () => alert('Error al actualizar estado')
      });
    }
  }
}
