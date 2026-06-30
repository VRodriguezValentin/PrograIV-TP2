import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getUsuario();
  if (usuario?.perfil === 'administrador') return true;
  router.navigate(['/publicaciones']);
  return false;
};
