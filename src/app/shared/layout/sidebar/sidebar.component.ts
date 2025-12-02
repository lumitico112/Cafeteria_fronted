import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { Modulo } from '../../../core/models/auth.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  menuItems: Modulo[] = [];
  private userSubscription?: Subscription;
  private menuSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.menuSubscription = this.authService.menu$.subscribe(menu => {
      this.menuItems = menu || [];
      
      const role = this.authService.getRole();

      // Filter out restricted items for Employees
      if (role === 'EMPLEADO') {
        this.menuItems = this.menuItems.filter(item => 
          item.label !== 'Dashboard' && 
          item.label !== 'Usuarios' &&
          item.basePath !== '/dashboard' &&
          item.basePath !== '/usuarios'
        );
      }
      
      // Customize for Employee POS
      if (role === 'ADMIN' || role === 'EMPLEADO') {
        const catalogoItem = this.menuItems.find(item => item.basePath === '/catalogo');
        
        if (catalogoItem) {
          // Rename existing item
          catalogoItem.label = 'Tomar Pedido (POS)';
          catalogoItem.icon = 'fas fa-cash-register';
        } else {
          // Add if not exists
          this.menuItems.push({
            id: 999, // Dummy ID
            nombre: 'POS',
            label: 'Tomar Pedido (POS)',
            basePath: '/catalogo',
            icon: 'fas fa-cash-register'
          });
        }
      }
      
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
