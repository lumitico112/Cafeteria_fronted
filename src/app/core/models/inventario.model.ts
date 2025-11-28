import { Producto } from './producto.model';

export interface Inventario {
  idInventario: number;
  producto: Producto; // El API devuelve el objeto producto completo anidado
  cantidadActual: number;
  stockMinimo: number;
  unidadMedida: string;
  fechaActualizacion: string;
}

export interface InventarioUpdate {
  cantidadActual: number;
  stockMinimo: number;
}
