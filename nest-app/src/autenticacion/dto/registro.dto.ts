import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  @Matches(/^[A-Za-zÀ-ÿ\s'-]+$/, { message: 'El nombre solo puede contener letras' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  @Matches(/^[A-Za-zÀ-ÿ\s'-]+$/, { message: 'El apellido solo puede contener letras' })
  apellido!: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(100, { message: 'El correo no puede superar los 100 caracteres' })
  correo!: string;

  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El nombre de usuario no puede superar los 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El nombre de usuario solo puede contener letras, números y guion bajo' })
  nombreUsuario!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña no puede superar los 64 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  contrasena!: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsString()
  fechaNacimiento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  perfil?: string;
}
