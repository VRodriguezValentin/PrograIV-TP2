import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../enviroments/enviroment';
import { PublicacionData } from '../../models/publicacion-data';
import { ComentarioData } from '../../models/comentario-data';

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
  @Output() deleteReq = new EventEmitter<string>();

  readonly apiUrl = environment.apiUrl;

  dropdownAbierto = signal(false);
  modalAbierto = signal(false);
  likeDado = signal(false);
  cantLikes = signal(0);
  comentariosLocales = signal<ComentarioData[]>([]);
  textoComentario = signal('');

  ngOnInit() {
    this.likeDado.set(this.pub.meGustas.includes(this.idUsuarioActual));
    this.cantLikes.set(this.pub.meGustas.length);
    this.comentariosLocales.set([...this.pub.comentarios]);
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
    const liked = !this.likeDado();
    this.likeDado.set(liked);
    this.cantLikes.update(v => liked ? v + 1 : v - 1);
  }

  toggleDropdown() {
    this.dropdownAbierto.update(v => !v);
  }

  abrirModal() {
    this.modalAbierto.set(true);
    this.dropdownAbierto.set(false);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  eliminar() {
    this.dropdownAbierto.set(false);
    this.deleteReq.emit(this.pub._id);
  }

  onInputComentario(e: Event) {
    this.textoComentario.set((e.target as HTMLTextAreaElement).value);
  }

  enviarComentario() {
    const texto = this.textoComentario().trim();
    if (!texto) return;
    this.comentariosLocales.update(cs => [
      ...cs,
      {
        _id: 'local-' + Date.now(),
        usuario: {
          _id: this.idUsuarioActual,
          nombreUsuario: this.nombreUsuarioActual || 'Tú',
          imagenPerfil: '',
        },
        texto,
        createdAt: new Date(),
      },
    ]);
    this.textoComentario.set('');
  }
}
