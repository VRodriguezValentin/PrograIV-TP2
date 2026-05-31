import {IsEmail,IsIn,IsNotEmpty,IsOptional,IsString,Matches,MinLength} from 'class-validator';

export class RegistroDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido!: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo!: string;

  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  nombreUsuario!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  contrasena!: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsString()
  fechaNacimiento!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  perfil?: string;
}
