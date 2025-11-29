export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion: string;
  estado: 'ACTIVO' | 'INACTIVO';
}
