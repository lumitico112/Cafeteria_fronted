import { Usuario } from './usuario.model';
import { Producto } from './producto.model';
import { Pago } from './pago.model';

export interface DetallePedido {
  idDetalle: number;
  pedido?: Pedido;
  idProducto: number;
  nombreProducto: string; // Added to match backend DTO
  producto?: Producto; // Made optional as backend might not send full object
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  idPedido: number;
  idUsuario: number;
  nombreCliente: string; // Added to match backend DTO
  usuario?: Usuario; // Made optional/deprecated
  atendidoPor?: Usuario; // Made optional/deprecated
  nombreEmpleado?: string; // Added to match backend DTO
  fecha: string;
  estado: 'PENDIENTE' | 'PREPARACION' | 'LISTO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  total: number;
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  direccionEntrega?: string;
  fechaRecojo?: string;
  detalles?: DetallePedido[];
  pagos?: Pago[];
}

export interface PedidoCreate {
  idUsuario: number;
  idAtendidoPor?: number;
  nombreCliente?: string;
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  direccionEntrega?: string;
  fechaRecojo?: string;
  detalles: {
    idProducto: number;
    cantidad: number;
  }[];
}
