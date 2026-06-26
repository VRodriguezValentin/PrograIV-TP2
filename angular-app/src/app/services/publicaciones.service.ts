import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { PublicacionData } from '../models/publicacion-data';
import { ComentarioData } from '../models/comentario-data';

export interface ListarParams {
  orden?: 'fecha' | 'meGustas';
  usuarioId?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(params: ListarParams = {}): Observable<PublicacionData[]> {
    let p = new HttpParams()
      .set('orden', params.orden ?? 'fecha')
      .set('offset', String(params.offset ?? 0))
      .set('limit', String(params.limit ?? 10));
    if (params.usuarioId) p = p.set('usuarioId', params.usuarioId);
    return this.http.get<PublicacionData[]>(`${this.API}/publicaciones`, { params: p });
  }

  crear(titulo: string, texto: string, usuarioId: string, imagen?: File): Observable<PublicacionData> {
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('texto', texto);
    form.append('usuarioId', usuarioId);
    if (imagen) form.append('imagen', imagen);
    return this.http.post<PublicacionData>(`${this.API}/publicaciones`, form);
  }

  eliminar(id: string, usuarioId: string, perfil: string): Observable<unknown> {
    return this.http.delete(`${this.API}/publicaciones/${id}`, {
      body: { usuarioId, perfil },
    });
  }

  darMeGusta(id: string, usuarioId: string): Observable<unknown> {
    return this.http.post(`${this.API}/publicaciones/${id}/me-gusta`, { usuarioId });
  }

  quitarMeGusta(id: string, usuarioId: string): Observable<unknown> {
    return this.http.delete(`${this.API}/publicaciones/${id}/me-gusta`, {
      body: { usuarioId },
    });
  }

  obtenerComentarios(
    pubId: string,
    offset: number,
    limit: number,
  ): Observable<{ comentarios: ComentarioData[]; total: number }> {
    const p = new HttpParams()
      .set('offset', String(offset))
      .set('limit', String(limit));
    return this.http.get<{ comentarios: ComentarioData[]; total: number }>(
      `${this.API}/publicaciones/${pubId}/comentarios`,
      { params: p },
    );
  }

  agregarComentario(
    pubId: string,
    dto: { usuarioId: string; nombreUsuario: string; imagenPerfil: string; texto: string },
  ): Observable<ComentarioData> {
    return this.http.post<ComentarioData>(
      `${this.API}/publicaciones/${pubId}/comentarios`,
      dto,
    );
  }

  editarComentario(
    pubId: string,
    comentarioId: string,
    texto: string,
    usuarioId: string,
  ): Observable<ComentarioData> {
    return this.http.put<ComentarioData>(
      `${this.API}/publicaciones/${pubId}/comentarios/${comentarioId}`,
      { texto, usuarioId },
    );
  }

  obtenerPorId(id: string): Observable<PublicacionData> {
    return this.http.get<PublicacionData>(`${this.API}/publicaciones/${id}`);
  }
}
