export interface ComentarioData {
    _id: string;
    usuario: { _id: string; nombreUsuario: string; imagenPerfil: string; };
    texto: string;
    createdAt: Date;
}