import { Categoria } from './categoria.model';

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  impuesto: number;
  estado: 'ACTIVO' | 'INACTIVO';
  imagenUrl?: string;
  categoria?: Categoria;
  idCategoria?: number; // Para formularios
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  impuesto: number;
  imagenUrl: string;
  estado: 'ACTIVO' | 'INACTIVO';
  idCategoria: number;
}
