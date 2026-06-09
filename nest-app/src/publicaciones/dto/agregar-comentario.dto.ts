import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AgregarComentarioDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsOptional()
  imagenPerfil?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto!: string;
}
