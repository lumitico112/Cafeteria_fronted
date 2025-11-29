import { Producto } from './producto.model';
import { Usuario } from './usuario.model';

export interface MovimientoInventario {
  idMovimiento: number;
  producto: Producto;
  usuario: Usuario;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  motivo?: string;
  fecha: string; // ISO Date
}
