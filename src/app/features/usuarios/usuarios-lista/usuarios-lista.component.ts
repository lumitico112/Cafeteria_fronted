import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsuariosService } from '../usuarios.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, UsuarioFormComponent],
  templateUrl: './usuarios-lista.component.html',
  styleUrls: ['./usuarios-lista.component.css']
})
export class UsuariosListaComponent implements OnInit {
  @ViewChild(UsuarioFormComponent) usuarioForm!: UsuarioFormComponent;
  usuarios: Usuario[] = [];
  isLoading = true;
  showModal = false;
  selectedUsuarioId?: number;

  showDetailsModal = false;
  selectedUsuario?: Usuario;

  constructor(
    private usuariosService: UsuariosService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarUsuarios();
    }
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data.map(u => ({
          ...u,
          telefono: u.telefono || u.phone || '',
          direccion: u.direccion || u.address || ''
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.notificationService.error('Error al cargar usuarios');
        this.isLoading = false;
      }
    });
  }

  crearUsuario() {
    this.selectedUsuarioId = undefined;
    this.showModal = true;
  }

  editarUsuario(usuario: Usuario) {
    this.selectedUsuarioId = usuario.idUsuario;
    this.showModal = true;
    setTimeout(() => {
      if (this.usuarioForm) {
        this.usuarioForm.isEditing = true;
        this.usuarioForm.usuarioId = usuario.idUsuario;
        this.usuarioForm.loadUsuario(usuario.idUsuario!);
      }
    }, 0);
  }

  verDetalles(usuario: Usuario) {
    this.selectedUsuario = usuario;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedUsuario = undefined;
  }

  toggleEstado(usuario: Usuario) {
    if (!usuario.idUsuario) return;
    
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const estadoOriginal = usuario.estado;
    
    // Actualización optimista
    usuario.estado = nuevoEstado;
    
    // Preparamos el objeto para enviar (asegurando que tenga todos los campos necesarios)
    const usuarioActualizado = { ...usuario, estado: nuevoEstado };
    
    this.usuariosService.update(usuario.idUsuario, usuarioActualizado).subscribe({
      next: () => {
        this.notificationService.toast(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'}`, 'success');
      },
      error: (err) => {
        console.error('Error al actualizar estado', err);
        // Revertir cambios si falla
        usuario.estado = estadoOriginal;
        this.notificationService.error('Error al actualizar el estado del usuario');
      }
    });
  }

  async eliminarUsuario(usuario: Usuario) {
    if (!usuario.idUsuario) return;
    
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de eliminar al usuario ${usuario.nombre}?`,
      'Sí, eliminar'
    );

    if (confirmed) {
      this.usuariosService.delete(usuario.idUsuario).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          this.notificationService.error('Error al eliminar usuario');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedUsuarioId = undefined;
  }

  onUsuarioSaved() {
    this.closeModal();
    this.cargarUsuarios();
  }
}
