import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartItemCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    // Mapeamos el carrito para obtener solo la cantidad total de items
    this.cartItemCount$ = new Observable(observer => {
      this.carritoService.cart$.subscribe(items => {
        observer.next(items.reduce((acc, item) => acc + item.cantidad, 0));
      });
    });
  }

  ngOnInit() {}

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
