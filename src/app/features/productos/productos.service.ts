import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Producto, ProductoCreate } from '../../core/models/producto.model';
import { API_CONFIG } from '../../core/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private endpoint = API_CONFIG.PRODUCTOS;

  constructor(private api: ApiService) {}

  getAll(): Observable<Producto[]> {
    return this.api.get<Producto[]>(this.endpoint);
  }

  getById(id: number): Observable<Producto> {
    return this.api.get<Producto>(`${this.endpoint}/${id}`);
  }

  getByCategoria(idCategoria: number): Observable<Producto[]> {
    return this.api.get<Producto[]>(`${this.endpoint}/categoria/${idCategoria}`);
  }

  create(producto: ProductoCreate): Observable<Producto> {
    return this.api.post<Producto>(this.endpoint, producto);
  }

  update(id: number, producto: ProductoCreate): Observable<Producto> {
    return this.api.put<Producto>(`${this.endpoint}/${id}`, producto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Usamos HttpClient directo en ApiService si fuera necesario para multipart,
    // pero aquí asumimos que ApiService puede manejarlo o lo extendemos.
    // Por simplicidad, asumimos que ApiService.post acepta FormData.
    return this.api.post('/files/upload', formData);
  }
}
