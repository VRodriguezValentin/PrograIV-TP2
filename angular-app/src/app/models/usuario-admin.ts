export interface UsuarioAdmin {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  perfil: string;
  activo: boolean;
  createdAt?: string;
}