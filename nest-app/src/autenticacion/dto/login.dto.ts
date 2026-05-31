import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El correo o nombre de usuario es requerido' })
  @IsString()
  identificador!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  contrasena!: string;
}
