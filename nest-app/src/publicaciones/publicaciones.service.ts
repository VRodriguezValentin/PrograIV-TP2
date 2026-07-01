import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AgregarComentarioDto } from './dto/agregar-comentario.dto';
import { EditarComentarioDto } from './dto/editar-comentario.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async crear(dto: CrearPublicacionDto, imagenUrl = '') {
    const pub = await this.publicacionModel.create({
      usuario: new Types.ObjectId(dto.usuarioId),
      titulo: dto.titulo,
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

    pipeline.push({
      $lookup: {
        from: 'usuarios',
        localField: 'usuario',
        foreignField: '_id',
        as: '_usuarioArr',
        pipeline: [
          { $match: { activo: { $ne: false } } },
          { $project: { nombre: 1, apellido: 1, nombreUsuario: 1, imagenPerfil: 1 } },
        ],
      },
    });

    pipeline.push({ $unwind: '$_usuarioArr' });

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    pipeline.push({ $addFields: { usuario: '$_usuarioArr' } });
    pipeline.push({ $addFields: { comentariosTotales: { $size: '$comentarios' } } });
    pipeline.push({ $addFields: { comentarios: [] } });
    pipeline.push({ $project: { _usuarioArr: 0, _mgCount: 0, activo: 0, __v: 0 } });

    return this.publicacionModel.aggregate(pipeline);
  }

  async obtenerPorId(id: string) {

    const pub = (await this.publicacionModel
      .findOne({ _id: new Types.ObjectId(id), activo: true })
      .populate('usuario', 'nombre apellido nombreUsuario imagenPerfil activo')
      .lean()) as any;
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    if (pub.usuario?.activo === false) throw new NotFoundException('Publicación no encontrada');

    if (pub.usuario) delete pub.usuario.activo;

    return {
      ...pub,
      meGustas: (pub.meGustas ?? []).map((m: any) => m.toString()),
      comentariosTotales: pub.comentarios?.length ?? 0,
      comentarios: [],
    };
  }

  async obtenerComentarios(id: string, offset = 0, limit = 5) {
    const pub = await this.publicacionModel
      .findOne({ _id: new Types.ObjectId(id), activo: true })
      .select('_id')
      .lean();
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const result = await this.publicacionModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $unwind: '$comentarios' },
      { $sort: { 'comentarios.createdAt': -1 } },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'comentarios.usuario._id',
          foreignField: '_id',
          as: '_autorComentario',
          pipeline: [{ $project: { activo: 1 } }],
        },
      },
      { $match: { '_autorComentario.0.activo': { $ne: false } } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          comentarios: [
            { $skip: offset },
            { $limit: limit },
            { $replaceRoot: { newRoot: '$comentarios' } },
          ],
        },
      },
    ]);

    const total = result[0]?.total[0]?.count ?? 0;
    const comentarios = result[0]?.comentarios ?? [];
    return { comentarios, total };
  }

  async editarComentario(pubId: string, comentarioId: string, dto: EditarComentarioDto) {
    const pub = await this.publicacionModel.findById(pubId);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada');

    const comentario = pub.comentarios.find(
      (c: any) => c._id.toString() === comentarioId,
    ) as any;
    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (comentario.usuario._id.toString() !== dto.usuarioId) {
      throw new ForbiddenException('No podés editar este comentario');
    }

    comentario.texto = dto.texto;
    comentario.modificado = true;
    pub.markModified('comentarios');
    await pub.save();
    return comentario;
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
