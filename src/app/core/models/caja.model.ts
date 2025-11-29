import { Usuario } from './usuario.model';

export interface Caja {
  idCaja: number;
  usuario: Usuario;
  fechaApertura: string;
  fechaCierre?: string;
  saldoInicial: number;
  saldoFinal?: number;
  diferencias?: number;
}
