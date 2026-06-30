import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CrearUsuarioAdminDto {
  @IsNotEmpty() @IsString() @MinLength(2) @MaxLength(20) @Matches(/^[A-Za-zÀ-ÿ\s'-]+$/)
  nombre!: string;

  @IsNotEmpty() @IsString() @MinLength(2) @MaxLength(20) @Matches(/^[A-Za-zÀ-ÿ\s'-]+$/)
  apellido!: string;

  @IsEmail() @MaxLength(50)
  correo!: string;

  @IsNotEmpty() @IsString() @MinLength(3) @MaxLength(20) @Matches(/^[a-zA-Z0-9_]+$/)
  nombreUsuario!: string;

  @IsNotEmpty() @IsString() @MinLength(8) @MaxLength(50) @Matches(/^(?=.*[A-Z])(?=.*\d)/)
  contrasena!: string;

  @IsNotEmpty() @IsDateString()
  fechaNacimiento!: string;

  @IsOptional() @IsString() @MaxLength(200)
  descripcion?: string;

  @IsIn(['usuario', 'administrador'])
  perfil!: string;
}
