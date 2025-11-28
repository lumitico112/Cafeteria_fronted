export interface DashboardStats {
  usuarios: number;
  productos: number;
  pedidosHoy: number;
  ventasHoy: number;
}

export interface Bitacora {
  idBitacora: number;
  idUsuario?: number;
  nombreUsuario?: string; // Posiblemente agregado en el DTO
  fechaHora: string;
  modulo: string;
  accion: string;
  descripcion: string;
}
