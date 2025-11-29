import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  { 
    path: 'logout', 
    loadComponent: () => import('./features/auth/logout/logout.component')
      .then(m => m.LogoutComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      { 
        path: 'productos', 
        loadComponent: () => import('./features/productos/productos-lista/productos-lista.component')
          .then(m => m.ProductosListaComponent)
      },
      { 
        path: 'productos/nuevo', 
        loadComponent: () => import('./features/productos/producto-form/producto-form.component')
          .then(m => m.ProductoFormComponent)
      },
      { 
        path: 'productos/editar/:id', 
        loadComponent: () => import('./features/productos/producto-form/producto-form.component')
          .then(m => m.ProductoFormComponent)
      },
      { 
        path: 'productos/detalle/:id', 
        loadComponent: () => import('./features/productos/producto-detalle/producto-detalle.component')
          .then(m => m.ProductoDetalleComponent)
      },
      { 
        path: 'categorias', 
        loadComponent: () => import('./features/categorias/categorias-lista/categorias-lista.component')
          .then(m => m.CategoriasListaComponent)
      },
      { 
        path: 'categorias/nueva', 
        loadComponent: () => import('./features/categorias/categoria-form/categoria-form.component')
          .then(m => m.CategoriaFormComponent)
      },
      { 
        path: 'categorias/editar/:id', 
        loadComponent: () => import('./features/categorias/categoria-form/categoria-form.component')
          .then(m => m.CategoriaFormComponent)
      },
      { 
        path: 'pedidos', 
        loadComponent: () => import('./features/pedidos/pedidos-lista/pedidos-lista.component').then(m => m.PedidosListaComponent),
        canActivate: [authGuard]
      },
      { 
        path: 'pedidos/nuevo', 
        loadComponent: () => import('./features/pedidos/pedido-form/pedido-form.component').then(m => m.PedidoFormComponent),
        canActivate: [authGuard]
      },
      { 
        path: 'pedidos/detalle/:id', 
        loadComponent: () => import('./features/pedidos/pedido-detalle/pedido-detalle.component').then(m => m.PedidoDetalleComponent),
        canActivate: [authGuard]
      },
      { 
        path: 'usuarios', 
        loadComponent: () => import('./features/usuarios/usuarios-lista/usuarios-lista.component').then(m => m.UsuariosListaComponent),
        canActivate: [authGuard]
      },
      { 
        path: 'inventario', 
        loadComponent: () => import('./features/inventario/inventario-lista/inventario-lista.component').then(m => m.InventarioListaComponent),
        canActivate: [authGuard]
      },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
