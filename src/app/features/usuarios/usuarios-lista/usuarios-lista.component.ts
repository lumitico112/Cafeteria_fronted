import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../usuarios.service';
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
    this.selectedUsuarioId = undefined;
    this.showModal = true;
    // Reset form logic handled in child component via isModal input or manual reset if needed
  }

  editarUsuario(usuario: Usuario) {
    this.selectedUsuarioId = usuario.idUsuario;
    this.showModal = true;
    // We need to trigger the load in the child component. 
    // Since *ngIf destroys the component when modal is closed, it will re-init when opened.
    // We can pass the ID via input if we modify the child, or just rely on the child's OnInit if we pass ID as input.
    // For now, let's modify the child to accept ID input or use ViewChild to call load.
    setTimeout(() => {
      if (this.usuarioForm) {
        this.usuarioForm.isEditing = true;
        this.usuarioForm.usuarioId = usuario.idUsuario;
        this.usuarioForm.loadUsuario(usuario.idUsuario!);
      }
    }, 0);
  }

  eliminarUsuario(usuario: Usuario) {
    if (!usuario.idUsuario) return;
    
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.usuariosService.delete(usuario.idUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          alert('Error al eliminar usuario');
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
