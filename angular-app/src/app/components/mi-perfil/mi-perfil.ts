import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent, PublicacionData } from '../publicacion/publicacion';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../enviroments/enviroment';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, Navbar, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  usuario = signal<Usuario | null>(null);
  misPublicaciones = signal<PublicacionData[]>([]);
  readonly apiUrl = environment.apiUrl;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const u = this.authService.getUsuario();
    this.usuario.set(u);
    if (u) this.misPublicaciones.set(this.generarMockPosts(u));
  }

  iniciales(): string {
    const u = this.usuario();
    if (!u) return '?';
    return `${u.nombre[0]}${u.apellido[0]}`.toUpperCase();
  }

  fechaNacimiento(): string {
    const u = this.usuario();
    if (!u?.fechaNacimiento) return 'Fecha no disponible';
    const fechaStr = u.fechaNacimiento.toString().split('T')[0];
    const [year, month, day] = fechaStr.split('-').map(Number);
    return day.toString().padStart(2, '0') + '/' + month.toString().padStart(2, '0') + '/' + year;
  }

  onDeletePost(id: string) {
    this.misPublicaciones.update(ps => ps.filter(p => p._id !== id));
  }

  private generarMockPosts(u: Usuario): PublicacionData[] {
    const miUser = {
      _id: u._id,
      nombreUsuario: u.nombreUsuario,
      imagenPerfil: u.imagenPerfil ?? '',
      nombre: u.nombre,
      apellido: u.apellido,
    };
    const ahora = Date.now();
    return [
      {
        _id: 'mp1',
        usuario: miUser,
        texto: '¡Llegué a Diamond en Valorant después de 200 horas de grind! La constancia da sus frutos.',
        meGustas: ['u2', 'u3', 'u4'],
        comentarios: [
          { _id: 'mc1', usuario: { _id: 'u2', nombreUsuario: 'NightWolf_X', imagenPerfil: '' }, texto: '¡Felicitaciones! ¿Qué agente jugás?', createdAt: new Date(ahora - 1800000) },
          { _id: 'mc2', usuario: { _id: 'u3', nombreUsuario: 'ShadowStrike', imagenPerfil: '' }, texto: 'Crack total', createdAt: new Date(ahora - 900000) },
        ],
        createdAt: new Date(ahora - 7200000),
      },
      {
        _id: 'mp2',
        usuario: miUser,
        texto: 'Setup nuevo terminado. RTX 4090, 32GB RAM, monitor 1440p 165hz. Ya no tengo excusas para perder.',
        meGustas: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'],
        comentarios: [
          { _id: 'mc3', usuario: { _id: 'u2', nombreUsuario: 'NightWolf_X', imagenPerfil: '' }, texto: '¡Qué bestia! ¿Cuánto salió todo?', createdAt: new Date(ahora - 82800000) },
        ],
        createdAt: new Date(ahora - 86400000),
      },
      {
        _id: 'mp3',
        usuario: miUser,
        texto: 'Squad buscando cuarto para competitivo en Apex Legends. Somos consistentes, juagmos todas las noches.',
        meGustas: ['u2', 'u5'],
        comentarios: [],
        createdAt: new Date(ahora - 172800000),
      },
    ];
  }
}
