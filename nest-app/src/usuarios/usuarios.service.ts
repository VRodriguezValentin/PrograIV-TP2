import { Injectable } from '@nestjs/common';
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
}
