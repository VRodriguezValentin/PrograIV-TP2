import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AgregarComentarioDto } from './dto/agregar-comentario.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async crear(dto: CrearPublicacionDto, imagenUrl = '') {
    const pub = await this.publicacionModel.create({
      usuario: new Types.ObjectId(dto.usuarioId),
      texto: dto.texto,
      imagen: imagenUrl,
    });
    return this.publicacionModel
      .findById(pub._id)
      .populate('usuario', 'nombre apellido nombreUsuario imagenPerfil')
      .lean();
  }

  async listar(
    orden: 'fecha' | 'meGustas' = 'fecha',
    usuarioId?: string,
    offset = 0,
    limit = 10,
  ) {
    const match: Record<string, any> = { activo: true };
    if (usuarioId) match.usuario = new Types.ObjectId(usuarioId);

    const pipeline: any[] = [{ $match: match }];

    if (orden === 'meGustas') {
      pipeline.push({ $addFields: { _mgCount: { $size: '$meGustas' } } });
      pipeline.push({ $sort: { _mgCount: -1, createdAt: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    pipeline.push({
      $lookup: {
        from: 'usuarios',
        localField: 'usuario',
        foreignField: '_id',
        as: '_usuarioArr',
        pipeline: [
          { $project: { nombre: 1, apellido: 1, nombreUsuario: 1, imagenPerfil: 1 } },
        ],
      },
    });
    pipeline.push({ $unwind: '$_usuarioArr' });
    pipeline.push({ $addFields: { usuario: '$_usuarioArr' } });
    pipeline.push({ $addFields: { comentariosTotales: { $size: '$comentarios' } } });
    pipeline.push({ $addFields: { comentarios: [] } });
    pipeline.push({ $project: { _usuarioArr: 0, _mgCount: 0, activo: 0, __v: 0 } });

    return this.publicacionModel.aggregate(pipeline);
  }

  async obtenerComentarios(id: string, offset = 0, limit = 5) {
    const pub = (await this.publicacionModel
      .findById(id)
      .select('comentarios activo')
      .lean()) as any;
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    const all: any[] = pub.comentarios ?? [];
    return { comentarios: all.slice(offset, offset + limit), total: all.length };
  }

  async agregarComentario(id: string, dto: AgregarComentarioDto) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    pub.comentarios.push({
      usuario: {
        _id: new Types.ObjectId(dto.usuarioId),
        nombreUsuario: dto.nombreUsuario,
        imagenPerfil: dto.imagenPerfil ?? '',
      },
      texto: dto.texto,
    } as any);

    await pub.save();
    return pub.comentarios[pub.comentarios.length - 1];
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    if (pub.usuario.toString() !== usuarioId && perfil !== 'administrador') {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }

    pub.activo = false;
    await pub.save();
    return { ok: true };
  }

  async darMeGusta(id: string, usuarioId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    const uid = new Types.ObjectId(usuarioId);
    if (pub.meGustas.some((m) => m.equals(uid))) return { meGustas: pub.meGustas };

    pub.meGustas.push(uid);
    await pub.save();
    return { meGustas: pub.meGustas };
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    const uid = new Types.ObjectId(usuarioId);
    pub.meGustas = pub.meGustas.filter((m) => !m.equals(uid)) as any;
    await pub.save();
    return { meGustas: pub.meGustas };
  }
}
