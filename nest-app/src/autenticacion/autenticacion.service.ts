import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  signToken(payload: Record<string, any>): string {
    const { iat, exp, ...clean } = payload;
    void iat; void exp;
    return this.jwtService.sign(clean, {
      secret: process.env.JWT_SECRET ?? 'nexo-dev-secret',
      expiresIn: '1m',
    });
  }

  async registro(dto: RegistroDto, imagenPerfil: string = '') {
    const existeCorreo = await this.usuariosService.findByCorreo(dto.correo);
    if (existeCorreo) throw new ConflictException('El correo ya está registrado');

    const existeUsuario = await this.usuariosService.findByNombreUsuario(dto.nombreUsuario);
    if (existeUsuario) throw new ConflictException('El nombre de usuario ya está en uso');

    const hash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.usuariosService.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo.toLowerCase(),
      nombreUsuario: dto.nombreUsuario,
      contrasena: hash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion || '',
      imagenPerfil,
      perfil: dto.perfil || 'usuario',
    });

    const obj = usuario.toObject() as Record<string, unknown>;
    const { contrasena: _, ...userData } = obj;
    const token = this.signToken({
      sub: obj._id!.toString(),
      _id: obj._id!.toString(),
      correo: obj.correo,
      nombreUsuario: obj.nombreUsuario,
      nombre: obj.nombre,
      apellido: obj.apellido,
      perfil: obj.perfil,
      imagenPerfil: obj.imagenPerfil ?? '',
      descripcion: obj.descripcion ?? '',
      fechaNacimiento: obj.fechaNacimiento,
    });
    return { token, usuario: userData };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByIdentificador(dto.identificador);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const obj = usuario.toObject() as Record<string, unknown>;
    const { contrasena: _, ...userData } = obj;
    const token = this.signToken({
      sub: obj._id!.toString(),
      _id: obj._id!.toString(),
      correo: obj.correo,
      nombreUsuario: obj.nombreUsuario,
      nombre: obj.nombre,
      apellido: obj.apellido,
      perfil: obj.perfil,
      imagenPerfil: obj.imagenPerfil ?? '',
      descripcion: obj.descripcion ?? '',
      fechaNacimiento: obj.fechaNacimiento,
    });
    return { token, usuario: userData };
  }

  verificarToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'nexo-dev-secret',
      }) as Record<string, any>;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }
}
