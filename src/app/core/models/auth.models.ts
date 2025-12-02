// Login
export interface LoginRequest {
  email: string;       // OJO: Backend espera 'email', no 'correo'
  password: string;    // OJO: Backend espera 'password', no 'contrasena'
}

// Registro (Público)
export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Respuesta del Backend
export interface Modulo {
  id: number;
  nombre: string;
  basePath: string;
  label: string;
  icon: string;
}

export interface AuthenticationResponse {
  token: string;
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  menu: Modulo[];
}

export interface User {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  email: string; // o correo
  correo?: string;
  telefono?: string;
  direccion?: string;
  nombreRol?: string;
  idRol?: number;
  sub?: string; // JWT subject
  authorities?: any[];
  estado?: string;
  fechaCreacion?: string;
}
