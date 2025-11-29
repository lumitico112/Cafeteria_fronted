import { Usuario } from './usuario.model';

export interface Bitacora {
  idBitacora: number;
  usuario?: Usuario;
  fechaHora: string;
  modulo?: string;
  accion?: string;
  descripcion?: string;
}
