export interface CrearUsuarioAdmin {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasena: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil: string;
}