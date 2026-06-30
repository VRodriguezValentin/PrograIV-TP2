import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { AdminGuard } from '../auth/admin.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    CloudinaryModule,
  ],
  providers: [UsuariosService, AdminGuard],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
