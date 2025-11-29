import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../inventario.service';
import { Inventario } from '../../../core/models/inventario.model';

@Component({
  selector: 'app-inventario-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-lista.component.html',
  styles: [`
    .table th { font-weight: 600; color: #495057; }
    .badge { font-weight: 500; padding: 0.5em 0.8em; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class InventarioListaComponent implements OnInit {
  inventario: Inventario[] = [];
  isLoading = true;
  
  // Modal de edición
  showModal = false;
  selectedItem?: Inventario;
  editCantidad: number = 0;
  editStockMinimo: number = 0;

  constructor(private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.isLoading = true;
    this.inventarioService.getAll().subscribe({
      next: (data) => {
        this.inventario = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario', err);
        this.isLoading = false;
      }
    });
  }

  getStockStatus(item: Inventario): string {
    if (item.cantidadActual <= 0) return 'CRITICO';
    if (item.cantidadActual <= item.stockMinimo) return 'BAJO';
    return 'NORMAL';
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'CRITICO': return 'badge bg-danger';
      case 'BAJO': return 'badge bg-warning text-dark';
      case 'NORMAL': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  editarStock(item: Inventario) {
    this.selectedItem = item;
    this.editCantidad = item.cantidadActual;
    this.editStockMinimo = item.stockMinimo;
    this.showModal = true;
  }

  guardarCambios() {
    if (!this.selectedItem) return;

    const update = {
      cantidadActual: this.editCantidad,
      stockMinimo: this.editStockMinimo
    };

    this.inventarioService.update(this.selectedItem.idInventario, update).subscribe({
      next: () => {
        this.cargarInventario();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al actualizar stock', err);
        alert('Error al actualizar stock');
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = undefined;
  }
}
