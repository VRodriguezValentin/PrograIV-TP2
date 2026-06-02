import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';
import { OrdenarPublicacionesPipe } from '../../pipes/ordenar-publicaciones.pipe';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { PublicacionData } from '../../models/publicacion-data';

type OrdenFeed = 'fecha' | 'meGustas';

@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, Navbar, PublicacionComponent, OrdenarPublicacionesPipe],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuario = signal<Usuario | null>(null);
  orden = signal<OrdenFeed>('fecha');
  publicaciones = signal<PublicacionData[]>([]);

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const u = this.authService.getUsuario();
    this.usuario.set(u);
    this.publicaciones.set(this.generarMockData(u));
  }

  cambiarOrden(o: OrdenFeed) {
    this.orden.set(o);
  }

  onDelete(id: string) {
    this.publicaciones.update(ps => ps.filter(p => p._id !== id));
  }

  private generarMockData(u: Usuario | null): PublicacionData[] {
    const miId = u?._id ?? 'mock-yo';
    const miUser = {
      _id: miId,
      nombreUsuario: u?.nombreUsuario ?? 'ProGamer99',
      imagenPerfil: u?.imagenPerfil ?? '',
      nombre: u?.nombre ?? 'Vos',
      apellido: u?.apellido ?? '',
    };
    const ahora = Date.now();
    return [
      {
        _id: 'p1',
        usuario: miUser,
        texto: '¡Finalmente llegué a Diamond en Valorant después de 200 horas! La grind valió la pena.',
        meGustas: ['u2', 'u3', 'u4'],
        comentarios: [
          { _id: 'c1', usuario: { _id: 'u2', nombreUsuario: 'NightWolf_X', imagenPerfil: '' }, texto: '¡Felicitaciones! ¿Qué agente jugás?', createdAt: new Date(ahora - 1800000) },
          { _id: 'c2', usuario: { _id: 'u3', nombreUsuario: 'ShadowStrike', imagenPerfil: '' }, texto: 'Yo llevo 500 horas y sigo en Gold jajaj', createdAt: new Date(ahora - 900000) },
        ],
        createdAt: new Date(ahora - 7200000),
      },
      {
        _id: 'p2',
        usuario: { _id: 'u2', nombreUsuario: 'NightWolf_X', imagenPerfil: '', nombre: 'Lucas', apellido: 'Martínez' },
        texto: '¿Alguien más probó el nuevo parche de LoL? Completamente rompieron a mi main con los cambios de items.',
        meGustas: ['u3', 'u4', 'u5', 'u6', miId],
        comentarios: [
          { _id: 'c3', usuario: { _id: miId, nombreUsuario: miUser.nombreUsuario, imagenPerfil: '' }, texto: 'Sí, la rompieron bien. Suerte que no lo juego.', createdAt: new Date(ahora - 600000) },
        ],
        createdAt: new Date(ahora - 10800000),
      },
      {
        _id: 'p3',
        usuario: { _id: 'u3', nombreUsuario: 'ShadowStrike', imagenPerfil: '', nombre: 'Sofía', apellido: 'Rodríguez' },
        texto: 'Buscando squad para Apex Legends ranked. Soy Plata, voy todos los días de 21 a 24hs. Manden DM si están interesados.',
        meGustas: ['u4'],
        comentarios: [],
        createdAt: new Date(ahora - 18000000),
      },
      {
        _id: 'p4',
        usuario: miUser,
        texto: 'Setup nuevo terminado. RTX 4090, 32GB RAM, monitor 1440p 165hz. Ya no tengo excusas para perder.',
        meGustas: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'],
        comentarios: [
          { _id: 'c4', usuario: { _id: 'u2', nombreUsuario: 'NightWolf_X', imagenPerfil: '' }, texto: '¡Qué bestia! ¿Cuánto salió todo?', createdAt: new Date(ahora - 82800000) },
          { _id: 'c5', usuario: { _id: 'u3', nombreUsuario: 'ShadowStrike', imagenPerfil: '' }, texto: 'Ya tenés la plata para el setup, ahora falta el skill jajaj', createdAt: new Date(ahora - 79200000) },
          { _id: 'c6', usuario: { _id: 'u4', nombreUsuario: 'CyberRaven', imagenPerfil: '' }, texto: '¡Me invitás a jugar algo!', createdAt: new Date(ahora - 75600000) },
        ],
        createdAt: new Date(ahora - 86400000),
      },
      {
        _id: 'p5',
        usuario: { _id: 'u4', nombreUsuario: 'CyberRaven', imagenPerfil: '', nombre: 'Tomás', apellido: 'García' },
        texto: '5 tips para mejorar el aim en CS2:\n1. Ajusten la sensibilidad\n2. Practiquen en aim_botz\n3. Hagan warmup siempre\n4. No muevan el mouse mientras disparan\n5. Paciencia, es lo más importante',
        meGustas: ['u2', 'u3', miId, 'u5'],
        comentarios: [
          { _id: 'c7', usuario: { _id: 'u5', nombreUsuario: 'PixelHunter', imagenPerfil: '' }, texto: 'Buen post, el punto 5 es clave', createdAt: new Date(ahora - 172800000) },
        ],
        createdAt: new Date(ahora - 172800000),
      },
    ];
  }
}
