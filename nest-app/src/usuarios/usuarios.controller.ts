import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as bcrypt from 'bcrypt';
import { AdminGuard } from '../auth/admin.guard';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const multerConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('usuarios')
@UseGuards(AdminGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  listar() {
    return this.usuariosService.listarTodos();
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagenPerfil', multerConfig))
  async crear(
    @Body() dto: CrearUsuarioAdminDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (file && !file.mimetype.match(/\/(jpg|jpeg|webp|gif)$/)) {
      throw new BadRequestException('Solo se permiten imágenes (jpg, jpeg, webp, gif)');
    }

    const existeCorreo = await this.usuariosService.findByCorreo(dto.correo);
    if (existeCorreo) throw new ConflictException('El correo ya está registrado');

    const existeUsuario = await this.usuariosService.findByNombreUsuario(dto.nombreUsuario);
    if (existeUsuario) throw new ConflictException('El nombre de usuario ya está en uso');

    const hash = await bcrypt.hash(dto.contrasena, 10);
    const imagenUrl = file
      ? (await this.cloudinaryService.uploadToFolder(file, 'foto-perfil')).secure_url
      : '';

    const usuario = await this.usuariosService.crearAdmin({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo.toLowerCase(),
      nombreUsuario: dto.nombreUsuario,
      contrasena: hash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion || '',
      imagenPerfil: imagenUrl,
      perfil: dto.perfil,
    });

    const obj = usuario.toObject() as Record<string, unknown>;
    const { contrasena: _, ...userData } = obj;
    return userData;
  }

  @Delete(':id')
  deshabilitar(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.deshabilitar(id, req.user._id);
  }

  @Post(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }
}
