export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  fecha_creacion?: string;
  idRol: number;
  nombreRol: string;
  telefono?: string;
  direccion?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  idRol: number;
  telefono?: string;
  direccion?: string;
}
