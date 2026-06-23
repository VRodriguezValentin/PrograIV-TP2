import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PublicacionData } from '../../models/publicacion-data';
import { PublicacionesService } from '../../services/publicaciones.service';

export type { PublicacionData } from '../../models/publicacion-data';

@Component({
  selector: 'app-publicacion',
  imports: [],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent implements OnInit {
  @Input() pub!: PublicacionData;
  @Input() idUsuarioActual = '';
  @Input() detallePath = '/publicaciones';
  @Output() deleteReq = new EventEmitter<string>();

  dropdownAbierto = signal(false);
  likeDado = signal(false);
  cantLikes = signal(0);
  comentariosTotales = signal(0);

  constructor(
    private publicacionesService: PublicacionesService,
    private router: Router,
  ) {}

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

  verDetalle() {
    this.router.navigate([this.detallePath, this.pub._id]);
  }

  eliminar() {
    this.dropdownAbierto.set(false);
    this.deleteReq.emit(this.pub._id);
  }
}
