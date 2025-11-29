import { Producto } from './producto.model';

export interface Inventario {
  idInventario: number;
  producto?: Producto;
  idProducto?: number;
  cantidadActual: number;
  stockMinimo: number;
  unidadMedida?: string;
  fechaActualizacion?: string;
}

export interface InventarioUpdate {
  cantidadActual: number;
  stockMinimo: number;
}
