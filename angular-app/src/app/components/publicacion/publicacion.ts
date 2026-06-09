import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../enviroments/enviroment';
import { PublicacionData } from '../../models/publicacion-data';
import { ComentarioData } from '../../models/comentario-data';
import { PublicacionesService } from '../../services/publicaciones.service';

export type { PublicacionData } from '../../models/publicacion-data';

@Component({
  selector: 'app-publicacion',
  imports: [CommonModule],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent implements OnInit {
  @Input() pub!: PublicacionData;
  @Input() idUsuarioActual = '';
  @Input() nombreUsuarioActual = '';
  @Input() imagenPerfilActual = '';
  @Output() deleteReq = new EventEmitter<string>();

  readonly apiUrl = environment.apiUrl;

  dropdownAbierto = signal(false);
  modalAbierto = signal(false);
  likeDado = signal(false);
  cantLikes = signal(0);
  comentariosTotales = signal(0);
  comentariosLocales = signal<ComentarioData[]>([]);
  textoComentario = signal('');
  cargandoComentarios = signal(false);
  hayMasComentarios = signal(false);

  private comentariosOffset = 0;
  private modalInicializado = false;

  constructor(private publicacionesService: PublicacionesService) {}

  ngOnInit() {
    this.likeDado.set(this.pub.meGustas.includes(this.idUsuarioActual));
    this.cantLikes.set(this.pub.meGustas.length);
    this.comentariosTotales.set(this.pub.comentariosTotales ?? this.pub.comentarios.length);
  }

  esMiPublicacion(): boolean {
    return this.pub.usuario._id === this.idUsuarioActual;
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
  }

  tiempoRelativo(fecha: Date): string {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (diff < 60) return 'justo ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} d`;
  }

  toggleLike() {
    if (!this.idUsuarioActual) return;
    const liked = !this.likeDado();
    this.likeDado.set(liked);
    this.cantLikes.update((v) => (liked ? v + 1 : v - 1));

    const accion = liked
      ? this.publicacionesService.darMeGusta(this.pub._id, this.idUsuarioActual)
      : this.publicacionesService.quitarMeGusta(this.pub._id, this.idUsuarioActual);

    accion.subscribe({
      error: () => {
        this.likeDado.set(!liked);
        this.cantLikes.update((v) => (liked ? v - 1 : v + 1));
      },
    });
  }

  toggleDropdown() {
    this.dropdownAbierto.update((v) => !v);
  }

  abrirModal() {
    this.modalAbierto.set(true);
    this.dropdownAbierto.set(false);
    if (!this.modalInicializado) {
      this.modalInicializado = true;
      this.cargarComentarios(true);
    }
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  eliminar() {
    this.dropdownAbierto.set(false);
    this.deleteReq.emit(this.pub._id);
  }

  cargarMasComentarios() {
    this.cargarComentarios(false);
  }

  onInputComentario(e: Event) {
    this.textoComentario.set((e.target as HTMLTextAreaElement).value);
  }

  enviarComentario() {
    const texto = this.textoComentario().trim();
    if (!texto || !this.idUsuarioActual) return;
    this.publicacionesService
      .agregarComentario(this.pub._id, {
        usuarioId: this.idUsuarioActual,
        nombreUsuario: this.nombreUsuarioActual || 'Tú',
        imagenPerfil: this.imagenPerfilActual,
        texto,
      })
      .subscribe({
        next: (comentario) => {
          this.comentariosLocales.update((cs) => [...cs, comentario]);
          this.comentariosTotales.update((v) => v + 1);
          this.textoComentario.set('');
        },
      });
  }

  private cargarComentarios(resetear: boolean) {
    if (this.cargandoComentarios()) return;
    if (resetear) {
      this.comentariosOffset = 0;
      this.comentariosLocales.set([]);
    }
    this.cargandoComentarios.set(true);
    this.publicacionesService
      .obtenerComentarios(this.pub._id, this.comentariosOffset, 5)
      .subscribe({
        next: (res) => {
          this.comentariosLocales.update((cs) => [...cs, ...res.comentarios]);
          this.comentariosOffset += res.comentarios.length;
          this.hayMasComentarios.set(this.comentariosOffset < res.total);
          this.comentariosTotales.set(res.total);
          this.cargandoComentarios.set(false);
        },
        error: () => this.cargandoComentarios.set(false),
      });
  }
}
