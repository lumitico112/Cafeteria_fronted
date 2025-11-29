import { Pedido } from './pedido.model';

export interface Pago {
  idPago: number;
  pedido?: Pedido;
  metodo: 'EFECTIVO' | 'TARJETA' | 'BILLETERA_DIGITAL';
  monto: number;
  fecha: string;
  estado: 'COMPLETADO' | 'FALLIDO' | 'PENDIENTE';
}
