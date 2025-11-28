import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosService } from '../usuarios.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-lista.component.html',
  styleUrls: ['./usuarios-lista.component.css']
})
export class UsuariosListaComponent implements OnInit {
  usuarios: Usuario[] = [];
  isLoading = true;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.isLoading = false;
      }
    });
  }

  crearUsuario() {
    // Implementar navegación a formulario de creación
    alert('Funcionalidad de crear usuario pendiente de implementar');
  }

  editarUsuario(usuario: Usuario) {
    // Implementar navegación a formulario de edición
    alert(`Editar usuario: ${usuario.nombre}`);
  }

  eliminarUsuario(usuario: Usuario) {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.usuariosService.delete(usuario.idUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          alert('Usuario eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          alert('Error al eliminar usuario');
        }
      });
    }
  }
}
