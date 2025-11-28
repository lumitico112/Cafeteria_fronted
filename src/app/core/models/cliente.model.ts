export interface Cliente {
  idCliente: number;
  nombres: string;
  apellidos: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: string;
  idUsuario?: number;
}
