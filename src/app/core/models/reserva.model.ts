import { Usuario } from './usuario.model';
import { Producto } from './producto.model';

export interface Reserva {
  idReserva: number;
  usuario: Usuario;
  producto?: Producto;
  tipo: 'MESA' | 'PRODUCTO';
  fechaReserva: string;
  horaReserva: string;
  estado: 'ACTIVA' | 'VENCIDA' | 'CANCELADA' | 'COMPLETADA';
}
