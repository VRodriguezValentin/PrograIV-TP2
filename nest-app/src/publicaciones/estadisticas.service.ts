import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity';

type Periodo = 'dia' | 'semana' | 'mes';

function fechaDesde(periodo: Periodo): Date {
  const d = new Date();
  if (periodo === 'dia') d.setHours(d.getHours() - 24);
  else if (periodo === 'semana') d.setDate(d.getDate() - 7);
  else d.setDate(d.getDate() - 30);
  return d;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private pubModel: Model<PublicacionDocument>,
  ) {}

  async publicacionesPorUsuario(periodo: Periodo) {
    const desde = fechaDesde(periodo);
    return this.pubModel.aggregate([
      { $match: { activo: true, createdAt: { $gte: desde } } },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuario',
          foreignField: '_id',
          as: 'u',
        },
      },
      { $unwind: '$u' },
      {
        $group: {
          _id: '$u.nombreUsuario',
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
      { $project: { nombreUsuario: '$_id', cantidad: 1, _id: 0 } },
    ]);
  }

  async comentariosEnTiempo(periodo: Periodo) {
    const desde = fechaDesde(periodo);
    const formato = periodo === 'dia' ? '%Y-%m-%dT%H:00' : '%Y-%m-%d';

    return this.pubModel.aggregate([
      { $match: { activo: true } },
      { $unwind: '$comentarios' },
      { $match: { 'comentarios.createdAt': { $gte: desde } } },
      {
        $group: {
          _id: {
            $dateToString: { format: formato, date: '$comentarios.createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { fecha: '$_id', cantidad: 1, _id: 0 } },
    ]);
  }

  async comentariosPorPublicacion(periodo: Periodo) {
    const desde = fechaDesde(periodo);

    return this.pubModel.aggregate([
      { $match: { activo: true } },
      {
        $project: {
          titulo: 1,
          cantidad: {
            $size: {
              $filter: {
                input: '$comentarios',
                as: 'c',
                cond: { $gte: ['$$c.createdAt', desde] },
              },
            },
          },
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
      { $project: { titulo: 1, cantidad: 1, _id: 0 } },
    ]);
  }
}
