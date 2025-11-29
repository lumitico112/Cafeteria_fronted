export interface Permiso {
  idPermiso: number;
  modulo: string;
  accion: string;
}

export interface Rol {
  idRol: number;
  nombre: string;      // "ADMIN", "EMPLEADO", "CLIENTE"
  descripcion?: string;
}
