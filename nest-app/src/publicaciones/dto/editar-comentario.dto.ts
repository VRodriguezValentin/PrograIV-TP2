import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EditarComentarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto!: string;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;
}
