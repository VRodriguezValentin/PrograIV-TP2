import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(identificador: string, contrasena: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.API_URL}/autenticacion/login`, {
        identificador,
        contrasena,
      })
      .pipe(tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))));
  }

  registro(formData: FormData): Observable<unknown> {
    return this.http.post(`${this.API_URL}/autenticacion/registro`, formData);
  }

  logout(): void {
    localStorage.removeItem('usuario');
  }

  getUsuario(): Usuario | null {
    const u = localStorage.getItem('usuario');
    return u ? (JSON.parse(u) as Usuario) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUsuario();
  }
}
