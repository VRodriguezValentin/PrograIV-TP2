import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (user?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo los administradores pueden acceder a este recurso');
    }
    return true;
  }
}
