import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findByCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ correo: correo.toLowerCase() }).exec();
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ nombreUsuario }).exec();
  }

  async findByIdentificador(identificador: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel
      .findOne({
        $or: [
          { correo: identificador.toLowerCase() },
          { nombreUsuario: identificador },
        ],
      })
      .exec();
  }

  async create(data: Partial<Usuario>): Promise<UsuarioDocument> {
    const usuario = new this.usuarioModel(data);
    return usuario.save();
  }

  async findById(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).exec();
  }

  async listarTodos(): Promise<Omit<UsuarioDocument, 'contrasena'>[]> {
    return this.usuarioModel
      .find({}, { contrasena: 0 })
      .sort({ createdAt: -1 })
      .exec();
  }

  async crearAdmin(data: Partial<Usuario>): Promise<UsuarioDocument> {
    const usuario = new this.usuarioModel(data);
    return usuario.save();
  }

  async deshabilitar(id: string, adminId: string): Promise<{ ok: boolean }> {
    if (id === adminId) throw new ForbiddenException('No podés deshabilitar tu propia cuenta');
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.perfil === 'administrador') throw new ForbiddenException('No podés deshabilitar a otro administrador');
    usuario.activo = false;
    await usuario.save();
    return { ok: true };
  }

  async habilitar(id: string): Promise<{ ok: boolean }> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = true;
    await usuario.save();
    return { ok: true };
  }
}
