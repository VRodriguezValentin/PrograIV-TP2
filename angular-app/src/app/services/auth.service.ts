import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(identificador: string, contrasena: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.API_URL}/autenticacion/login`, { identificador, contrasena })
      .pipe(tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))));
  }

  registro(formData: FormData): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.API_URL}/autenticacion/registro`, formData)
      .pipe(tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))));
  }

  autorizar(): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.API_URL}/autenticacion/autorizar`, {})
      .pipe(tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))));
  }

  refrescar(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.API_URL}/autenticacion/refrescar`, {});
  }

  actualizarPerfil(formData: FormData): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`${this.API_URL}/autenticacion/perfil`, formData)
      .pipe(tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))));
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.http.post(`${this.API_URL}/autenticacion/logout`, {}).subscribe();
  }

  getUsuario(): Usuario | null {
    const u = localStorage.getItem('usuario');
    return u ? (JSON.parse(u) as Usuario) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUsuario();
  }
}
