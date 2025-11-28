export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  impuesto: number;
  imagenUrl: string;
  estado: 'ACTIVO' | 'INACTIVO';
  idCategoria: number;
  nombreCategoria: string;
  cantidadActual: number;
  stockMinimo: number;
  unidadMedida: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  impuesto: number;
  imagenUrl: string;
  estado: 'ACTIVO' | 'INACTIVO';
  idCategoria: number;
  cantidadActual: number;
  stockMinimo: number;
  unidadMedida: string;
}
