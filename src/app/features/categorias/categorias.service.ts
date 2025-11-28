import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Categoria, CategoriaCreate } from '../../core/models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private endpoint = '/categorias';

  constructor(private api: ApiService) {}

  getAll(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>(this.endpoint);
  }

  getById(id: number): Observable<Categoria> {
    return this.api.get<Categoria>(`${this.endpoint}/${id}`);
  }

  create(categoria: CategoriaCreate): Observable<Categoria> {
    return this.api.post<Categoria>(this.endpoint, categoria);
  }

  update(id: number, categoria: CategoriaCreate): Observable<Categoria> {
    return this.api.put<Categoria>(`${this.endpoint}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
