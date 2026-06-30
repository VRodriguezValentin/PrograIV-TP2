import { Routes } from '@angular/router';
import { Cargando } from './components/cargando/cargando';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Publicaciones } from './components/publicaciones/publicaciones';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { PublicacionDetalle } from './components/publicacion-detalle/publicacion-detalle';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Cargando },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  {
    path: 'publicaciones',
    component: Publicaciones,
    children: [
      { path: ':id', component: PublicacionDetalle },
    ],
  },
  {
    path: 'mi-perfil',
    component: MiPerfil,
    children: [
      { path: ':id', component: PublicacionDetalle },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '/' },
];
