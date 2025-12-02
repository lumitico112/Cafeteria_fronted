import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomeComponent implements OnInit {
  userName: string = '';
  role: string = '';
  loadingMessage: string = 'Cargando...';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.role = this.authService.getRole() || '';
    
    if (user) {
      this.userName = user.nombre || 'Usuario';
    }

    if (this.role === 'ADMIN' || this.role === 'EMPLEADO') {
      this.loadingMessage = 'Cargando Dashboard...';
    } else {
      this.loadingMessage = 'Preparando tu experiencia...';
    }

    // Simulate loading delay for smooth transition
    setTimeout(() => {
      if (this.role === 'ADMIN' || this.role === 'EMPLEADO') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/catalogo']);
      }
    }, 2500);
  }
}
