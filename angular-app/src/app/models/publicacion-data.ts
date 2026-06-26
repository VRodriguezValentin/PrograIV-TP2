import { ComentarioData } from './comentario-data';

export interface PublicacionData {
    _id: string;
    usuario: {
    _id: string;
    nombreUsuario: string;
    imagenPerfil: string;
    nombre: string;
    apellido: string;
    };
    titulo: string;
    texto: string;
    imagen?: string;
    meGustas: string[];
    comentarios: ComentarioData[];
    comentariosTotales?: number;
    createdAt: Date;
}