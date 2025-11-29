import { Usuario } from './usuario.model';
import { Producto } from './producto.model';
import { Pago } from './pago.model';

export interface DetallePedido {
  idDetalle: number;
  pedido?: Pedido;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  idPedido: number;
  usuario: Usuario;
  atendidoPor?: Usuario;
  fecha: string;
  estado: 'PENDIENTE' | 'PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  total: number;
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  detalles?: DetallePedido[];
  pagos?: Pago[];
}

export interface PedidoCreate {
  idUsuario: number;
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  detalles: {
    idProducto: number;
    cantidad: number;
  }[];
}
