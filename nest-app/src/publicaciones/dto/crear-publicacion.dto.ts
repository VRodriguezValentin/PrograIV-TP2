import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  @Matches(/\S/, { message: 'El título no puede contener solo espacios' })
  titulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El texto es requerido' })
  @MaxLength(2000)
  @Matches(/\S/, { message: 'El texto no puede contener solo espacios' })
  texto!: string;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;
}
