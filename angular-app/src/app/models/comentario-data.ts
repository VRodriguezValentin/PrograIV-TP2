export interface ComentarioData {
    _id: string;
    usuario: { _id: string; nombreUsuario: string; imagenPerfil: string; };
    texto: string;
    modificado?: boolean;
    createdAt: Date;
    updatedAt?: Date;
}