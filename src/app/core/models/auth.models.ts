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
export interface AuthenticationResponse {
  token: string;
}
