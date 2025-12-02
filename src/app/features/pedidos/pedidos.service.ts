import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Pedido, PedidoCreate } from '../../core/models/pedido.model';
import { API_CONFIG } from '../../core/constants';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private endpoint = API_CONFIG.PEDIDOS;

  constructor(private api: ApiService) {}

  getAll(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>(this.endpoint);
  }

  getById(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`${this.endpoint}/${id}`);
  }

  misPedidos(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>(`${this.endpoint}/mis-pedidos`);
  }

  getByEstado(estado: string): Observable<Pedido[]> {
    return this.api.get<Pedido[]>(`${this.endpoint}/estado/${estado}`);
  }

  create(pedido: PedidoCreate): Observable<Pedido> {
    return this.api.post<Pedido>(this.endpoint, pedido);
  }

  updateEstado(id: number, estado: string): Observable<Pedido> {
    return this.api.patch<Pedido>(`${this.endpoint}/${id}/estado`, {}, { estado });
  }
}
