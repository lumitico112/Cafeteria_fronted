// Roles del Sistema (IDs)
export const ROLES = {
  ADMIN: 1,
  EMPLEADO: 2,
  CLIENTE: 3
};

// Estados de Usuario / Producto
export enum EstadoGeneral {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

// Estados de Pedido
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  PREPARACION = 'PREPARACION',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

// Tipos de Entrega
export enum TipoEntrega {
  DELIVERY = 'DELIVERY',
  RETIRO = 'RETIRO',
  LOCAL = 'LOCAL'
}

// Métodos de Pago
export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  BILLETERA_DIGITAL = 'BILLETERA_DIGITAL'
}

// Tipos de Promoción
export enum TipoPromocion {
  DESCUENTO = 'DESCUENTO',
  COMBO = 'COMBO',
  DOS_POR_UNO = 'DOS_POR_UNO'
}

// Endpoints Base (Útil para environment.ts)
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  AUTH: 'http://localhost:8080/auth',
  USUARIOS: 'http://localhost:8080/usuario',    // Singular (Correcto según servidor)
  PRODUCTOS: 'http://localhost:8080/productos', // Plural
  PEDIDOS: 'http://localhost:8080/pedidos',     // Plural
  CATEGORIAS: 'http://localhost:8080/categorias', // Plural
  INVENTARIO: 'http://localhost:8080/inventario', // Plural
  UPLOADS: 'http://localhost:8080/uploads'      // Imágenes estáticas
};
