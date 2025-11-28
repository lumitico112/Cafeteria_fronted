import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStats } from './dashboard.model';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ProductosService } from '../productos/productos.service';
import { PedidosService } from '../pedidos/pedidos.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentDate = new Date();
  stats: DashboardStats = {
    usuarios: 0,
    productos: 0,
    pedidosHoy: 0,
    ventasHoy: 0
  };
  isLoading = true;
  isBrowser: boolean;

  constructor(
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadStats();
    } else {
      this.isLoading = false; // No cargar en el servidor
    }
  }

  loadStats() {
    this.isLoading = true;
    
    forkJoin({
      usuarios: this.usuariosService.getAll(),
      productos: this.productosService.getAll(),
      pedidos: this.pedidosService.getAll()
    }).subscribe({
      next: (data) => {
        // Calcular estadísticas en el frontend
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pedidosHoy = data.pedidos.filter(p => {
          const fechaPedido = new Date(p.fecha);
          return fechaPedido >= today;
        });

        const ventasHoy = pedidosHoy
          .filter(p => p.estado !== 'CANCELADO')
          .reduce((sum, p) => sum + p.total, 0);

        this.stats = {
          usuarios: data.usuarios.length,
          productos: data.productos.length,
          pedidosHoy: pedidosHoy.length,
          ventasHoy: ventasHoy
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats', err);
        this.isLoading = false;
      }
    });
  }
}
