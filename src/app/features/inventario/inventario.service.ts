import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/constants';
import { Inventario, InventarioUpdate } from '../../core/models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = API_CONFIG.INVENTARIO;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.apiUrl);
  }

  getBajoStock(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/bajo-stock`);
  }

  update(id: number, inventario: InventarioUpdate): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/${id}`, inventario);
  }
}
