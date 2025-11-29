import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Usuario } from '../../core/models/usuario.model';
import { API_CONFIG } from '../../core/constants';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private endpoint = API_CONFIG.USUARIOS;

  constructor(private api: ApiService) {}

  getAll(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.endpoint);
  }

  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`);
  }

  create(usuario: any): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, usuario);
  }

  update(id: number, usuario: any): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
