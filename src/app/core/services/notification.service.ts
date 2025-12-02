import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  /**
   * Muestra una alerta de éxito básica
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto '¡Éxito!')
   */
  success(message: string, title: string = '¡Éxito!'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#6f4e37', // Coffee color
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra una alerta de error
   * @param message Mensaje de error
   * @param title Título opcional (por defecto 'Error')
   */
  error(message: string, title: string = 'Error'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Cerrar'
    });
  }

  /**
   * Muestra una alerta de advertencia
   * @param message Mensaje de advertencia
   */
  warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonColor: '#f0ad4e',
      confirmButtonText: 'Entendido'
    });
  }

  /**
   * Muestra una alerta de información
   * @param message Mensaje informativo
   */
  info(message: string, title: string = 'Información'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonColor: '#6f4e37',
      confirmButtonText: 'Ok'
    });
  }

  /**
   * Muestra un diálogo de confirmación
   * @param message Pregunta o mensaje
   * @param confirmText Texto del botón confirmar
   * @returns Promise<boolean> true si confirma, false si cancela
   */
  async confirm(message: string, confirmText: string = 'Sí, confirmar'): Promise<boolean> {
    const result: SweetAlertResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f4e37',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar'
    });

    return result.isConfirmed;
  }

  /**
   * Muestra un toast (notificación pequeña) en la esquina superior derecha
   * @param message Mensaje
   * @param icon Icono (success, error, etc.)
   */
  toast(message: string, icon: SweetAlertIcon = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: message
    });
  }
}
