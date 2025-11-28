import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
import { ProductosService } from '../../productos/productos.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { PedidoCreate } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pedido-form.component.html',
  styleUrls: ['./pedido-form.component.css']
})
export class PedidoFormComponent implements OnInit {
  pedidoForm: FormGroup;
  productos: Producto[] = [];
  isLoading = true;
  isSaving = false;
  total = 0;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private pedidosService: PedidosService,
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {
    this.pedidoForm = this.fb.group({
      tipoEntrega: ['LOCAL', Validators.required],
      detalles: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadData();
    // Inicializar con un detalle vacío
    this.addDetalle();
    
    // Suscribirse a cambios para recalcular total
    this.pedidoForm.get('detalles')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    // Obtener usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadData() {
    this.isLoading = true;
    this.productosService.getAll().subscribe({
      next: (data) => {
        // Solo mostrar productos activos
        this.productos = data.filter(p => p.estado === 'ACTIVO');
        this.isLoading = false;
      },
      error: () => {
        alert('Error al cargar productos');
        this.isLoading = false;
      }
    });
  }

  get detalles() {
    return this.pedidoForm.get('detalles') as FormArray;
  }

  addDetalle() {
    const detalleForm = this.fb.group({
      idProducto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
    this.detalles.push(detalleForm);
  }

  removeDetalle(index: number) {
    this.detalles.removeAt(index);
  }

  updateCantidad(index: number, change: number) {
    const control = this.detalles.at(index).get('cantidad');
    if (control) {
      const currentValue = control.value || 0;
      const newValue = currentValue + change;
      if (newValue >= 1) {
        control.setValue(newValue);
      }
    }
  }

  onProductoChange(index: number) {
    // Recalcular total cuando cambia el producto
    this.calculateTotal();
  }

  getSubtotal(index: number): number {
    const detalle = this.detalles.at(index).value;
    if (detalle.idProducto && detalle.cantidad) {
      const producto = this.productos.find(p => p.idProducto == detalle.idProducto);
      return producto ? producto.precio * detalle.cantidad : 0;
    }
    return 0;
  }

  calculateTotal() {
    this.total = this.detalles.controls.reduce((acc, control) => {
      const detalle = control.value;
      if (detalle.idProducto && detalle.cantidad) {
        const producto = this.productos.find(p => p.idProducto == detalle.idProducto);
        return acc + (producto ? producto.precio * detalle.cantidad : 0);
      }
      return acc;
    }, 0);
  }

  onSubmit() {
    if (this.pedidoForm.valid && this.total > 0) {
      this.isSaving = true;
      
      // Construir objeto PedidoCreate
      // Nota: Asumimos que el usuario actual es el cliente. 
      // En un sistema real, un admin podría seleccionar el cliente.
      // Aquí usamos un ID temporal o extraído del token si estuviera disponible el ID numérico.
      // Como el token tiene 'sub' (email), necesitaríamos buscar el ID.
      // Por simplicidad y robustez, usaremos el ID 3 (Cliente Demo) si no tenemos el ID real.
      
      // TODO: Obtener ID real del usuario desde el servicio de usuarios usando el email del token
      const usuarioId = this.currentUser?.idUsuario || 3; 

      const newPedido: PedidoCreate = {
        idUsuario: usuarioId,
        tipoEntrega: this.pedidoForm.get('tipoEntrega')?.value,
        detalles: this.detalles.value.map((d: any) => ({
          idProducto: Number(d.idProducto),
          cantidad: d.cantidad
        }))
      };

      this.pedidosService.create(newPedido).subscribe({
        next: () => {
          alert('Pedido creado exitosamente');
          this.router.navigate(['/pedidos']);
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear el pedido');
          this.isSaving = false;
        }
      });
    } else {
      this.pedidoForm.markAllAsTouched();
    }
  }
}
