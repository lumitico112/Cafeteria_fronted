export interface Promocion {
  idPromocion: number;
  nombre: string;
  descripcion: string;
  tipo: 'DESCUENTO' | 'COMBO' | 'DOS_POR_UNO';
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVA' | 'INACTIVA';
}

export interface PromocionCreate {
  nombre: string;
  descripcion: string;
  tipo: 'DESCUENTO' | 'COMBO' | 'DOS_POR_UNO';
  fechaInicio: string;
  fechaFin: string;
}
