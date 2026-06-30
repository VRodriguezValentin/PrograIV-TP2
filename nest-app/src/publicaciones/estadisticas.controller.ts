import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { EstadisticasService } from './estadisticas.service';

type Periodo = 'dia' | 'semana' | 'mes';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query('periodo') periodo: string) {
    const p: Periodo = ['dia', 'semana', 'mes'].includes(periodo) ? (periodo as Periodo) : 'semana';
    return this.estadisticasService.publicacionesPorUsuario(p);
  }

  @Get('comentarios-en-tiempo')
  comentariosEnTiempo(@Query('periodo') periodo: string) {
    const p: Periodo = ['dia', 'semana', 'mes'].includes(periodo) ? (periodo as Periodo) : 'semana';
    return this.estadisticasService.comentariosEnTiempo(p);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query('periodo') periodo: string) {
    const p: Periodo = ['dia', 'semana', 'mes'].includes(periodo) ? (periodo as Periodo) : 'semana';
    return this.estadisticasService.comentariosPorPublicacion(p);
  }
}
