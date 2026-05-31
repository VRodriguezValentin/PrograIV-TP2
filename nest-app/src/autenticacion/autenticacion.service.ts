import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacionService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registro(dto: RegistroDto, imagenPerfil: string = '') {
    const existeCorreo = await this.usuariosService.findByCorreo(dto.correo);
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existeUsuario = await this.usuariosService.findByNombreUsuario(
      dto.nombreUsuario,
    );
    if (existeUsuario) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

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

    const usuarioObj = usuario.toObject() as Record<string, unknown>;
    const { contrasena: _, ...result } = usuarioObj;
    return result;
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByIdentificador(
      dto.identificador,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasena,
    );
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const usuarioObj = usuario.toObject() as Record<string, unknown>;
    const { contrasena: _, ...result } = usuarioObj;
    return result;
  }
}
