export interface DetallePedido {
  idDetalle?: number;
  idProducto: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Pedido {
  idPedido: number;
  fecha: string;
  estado: 'PENDIENTE' | 'PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  total: number;
  idUsuario: number;
  nombreCliente: string;
  atendidoPor?: number;
  nombreEmpleado?: string;
  detalles: DetallePedido[];
}

export interface PedidoCreate {
  idUsuario: number;
  tipoEntrega: 'DELIVERY' | 'RETIRO' | 'LOCAL';
  detalles: {
    idProducto: number;
    cantidad: number;
  }[];
}
