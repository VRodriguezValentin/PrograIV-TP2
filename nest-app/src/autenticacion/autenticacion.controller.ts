import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const multerConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService, private readonly cloudinaryService: CloudinaryService,) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagenPerfil', multerConfig))
  async registro(
    @Body() dto: RegistroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && !file.mimetype.match(/\/(jpg|jpeg|webp|gif)$/)) {
      throw new BadRequestException('Solo se permiten imágenes\n(jpg, jpeg, webp, gif)');
    }

    const imagenUrl = file
      ? (await this.cloudinaryService.uploadImage(file)).secure_url
      : '';
    return this.autenticacionService.registro(dto, imagenUrl);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }
}
