import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { UsuarioAdmin } from '../models/usuario-admin';
import { PublicacionesPorUsuario } from '../models/publicaciones-por-usuario';
import { ComentariosEnTiempo } from '../models/comentarios-en-tiempo';
import { ComentariosPorPublicacion } from '../models/comentarios-por-publicacion';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.API}/usuarios`);
  }

  crearUsuario(data: FormData): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(`${this.API}/usuarios`, data);
  }

  deshabilitarUsuario(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/usuarios/${id}`);
  }

  habilitarUsuario(id: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.API}/usuarios/${id}/habilitar`, {});
  }

  publicacionesPorUsuario(periodo: string): Observable<PublicacionesPorUsuario[]> {
    return this.http.get<PublicacionesPorUsuario[]>(`${this.API}/estadisticas/publicaciones-por-usuario`, {
      params: { periodo },
    });
  }

  comentariosEnTiempo(periodo: string): Observable<ComentariosEnTiempo[]> {
    return this.http.get<ComentariosEnTiempo[]>(`${this.API}/estadisticas/comentarios-en-tiempo`, {
      params: { periodo },
    });
  }

  comentariosPorPublicacion(periodo: string): Observable<ComentariosPorPublicacion[]> {
    return this.http.get<ComentariosPorPublicacion[]>(`${this.API}/estadisticas/comentarios-por-publicacion`, {
      params: { periodo },
    });
  }
}
