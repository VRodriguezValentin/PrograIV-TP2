import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AgregarComentarioDto } from './dto/agregar-comentario.dto';
import { EditarComentarioDto } from './dto/editar-comentario.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const multerConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  async crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
      throw new BadRequestException('Formato de imagen no soportado');
    }
    const imagenUrl = file
      ? (await this.cloudinaryService.uploadToFolder(file, 'publicaciones')).secure_url
      : '';
    return this.publicacionesService.crear(dto, imagenUrl);
  }

  @Get()
  listar(
    @Query('orden') orden: 'fecha' | 'meGustas' = 'fecha',
    @Query('usuarioId') usuarioId?: string,
    @Query('offset') offset = '0',
    @Query('limit') limit = '10',
  ) {
    return this.publicacionesService.listar(orden, usuarioId, +offset, +limit);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
    @Body('perfil') perfil: string,
  ) {
    return this.publicacionesService.eliminar(id, usuarioId, perfil);
  }

  @Post(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  darMeGusta(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Delete(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  quitarMeGusta(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  }

  @Get(':id/comentarios')
  obtenerComentarios(
    @Param('id') id: string,
    @Query('offset') offset = '0',
    @Query('limit') limit = '5',
  ) {
    return this.publicacionesService.obtenerComentarios(id, +offset, +limit);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }

  @Post(':id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  agregarComentario(@Param('id') id: string, @Body() dto: AgregarComentarioDto) {
    return this.publicacionesService.agregarComentario(id, dto);
  }

  @Put(':id/comentarios/:comentarioId')
  @HttpCode(HttpStatus.OK)
  editarComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body() dto: EditarComentarioDto,
  ) {
    return this.publicacionesService.editarComentario(id, comentarioId, dto);
  }
}
