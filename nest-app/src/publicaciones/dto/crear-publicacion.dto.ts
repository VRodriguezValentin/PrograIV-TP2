import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  texto!: string;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;
}
