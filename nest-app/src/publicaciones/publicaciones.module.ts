import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    CloudinaryModule,
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService, AdminGuard],
})
export class PublicacionesModule {}
