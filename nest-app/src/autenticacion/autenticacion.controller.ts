import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Public } from '../auth/public.decorator';

const multerConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

const COOKIE_OPTS = {
  httpOnly: true,
  maxAge: 15 * 60 * 1000,
  sameSite: 'lax' as const,
};

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService, private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagenPerfil', multerConfig))
  async registro(
    @Body() dto: RegistroDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res({ passthrough: true }) res: any,
  ) {
    if (file && !file.mimetype.match(/\/(jpg|jpeg|webp|gif)$/)) {
      throw new BadRequestException('Solo se permiten imágenes (jpg, jpeg, webp, gif)');
    }
    const imagenUrl = file
      ? (await this.cloudinaryService.uploadToFolder(file, 'foto-perfil')).secure_url
      : '';
    const { token, usuario } = await this.autenticacionService.registro(dto, imagenUrl);
    res.cookie('nexo_token', token, COOKIE_OPTS);
    return usuario;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const { token, usuario } = await this.autenticacionService.login(dto);
    res.cookie('nexo_token', token, COOKIE_OPTS);
    return usuario;
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  autorizar(@Req() req: any) {
    return (req as any).user;
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  refrescar(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const payload = (req as any).user as Record<string, any>;
    const newToken = this.autenticacionService.signToken(payload);
    res.cookie('nexo_token', newToken, COOKIE_OPTS);
    return { ok: true };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('nexo_token');
    return { ok: true };
  }
}
