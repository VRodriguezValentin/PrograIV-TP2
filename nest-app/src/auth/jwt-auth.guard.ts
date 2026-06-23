import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token: string | undefined = request.cookies?.nexo_token;
    if (!token) throw new UnauthorizedException('Sin autenticación');

    try {
      request.user = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'nexo-dev-secret',
      });
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }
}
