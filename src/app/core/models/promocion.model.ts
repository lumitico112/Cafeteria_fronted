import { Producto } from './producto.model';

export interface Promocion {
  idPromocion: number;
  nombre: string;
  descripcion?: string;
  tipo: 'DESCUENTO' | 'COMBO' | 'DOS_POR_UNO';
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVA' | 'INACTIVA';
  productos?: Producto[];
}

export interface PromocionCreate {
  nombre: string;
  descripcion: string;
  tipo: 'DESCUENTO' | 'COMBO' | 'DOS_POR_UNO';
  fechaInicio: string;
  fechaFin: string;
}
