import { Rol } from './rol.model';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  idRol?: number;
  rol?: Rol; // Mantenemos la referencia al objeto Rol si es necesario para el frontend
  
  telefono?: string;
  direccion?: string;
  puntosFidelizacion?: number;
  
  // Campos de compatibilidad (opcionales)
  fechaCreacion?: string;
  fecha_creacion?: string;
  nombreRol?: string;
} // Mantenido para compatibilidad con login

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  idRol: number;
  telefono?: string;
  direccion?: string;
}
