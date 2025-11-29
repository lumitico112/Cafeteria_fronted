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
  
  telefono: string;
  direccion: string;
  puntosFidelizacion?: number;
  fechaCreacion: string; // Definitivo según backend
  
  // Campos de compatibilidad (opcionales)
  fecha_creacion?: string;
  createdAt?: string; 
  nombreRol?: string;
  
  // Compatibilidad con backend en inglés (si fuera necesario)
  phone?: string;
  address?: string;
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
