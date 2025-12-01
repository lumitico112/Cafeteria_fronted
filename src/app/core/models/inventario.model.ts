import { Producto } from './producto.model';

export interface Inventario {
  idInventario: number;
  idProducto: number;
  nombreProducto: string;
  cantidadActual: number;
  stockMinimo: number;
  unidadMedida: string;
  fechaActualizacion?: string;
  estado?: string;
}

export interface InventarioUpdate {
  cantidadActual: number;
  stockMinimo: number;
}
