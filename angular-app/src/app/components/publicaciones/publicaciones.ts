import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Usuario } from '../../models/usuario';
import { PublicacionData } from '../../models/publicacion-data';

type OrdenFeed = 'fecha' | 'meGustas';

@Component({
  selector: 'app-publicaciones',
  imports: [Navbar, PublicacionComponent, RouterOutlet],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuario = signal<Usuario | null>(null);
  orden = signal<OrdenFeed>('fecha');
  publicaciones = signal<PublicacionData[]>([]);
  cargando = signal(false);
  hayMas = signal(true);
  mostrarCrear = signal(false);
  textoNueva = signal('');
  imagenNueva = signal<File | null>(null);
  imagenPreview = signal<string | null>(null);
  creando = signal(false);

  private readonly LIMIT = 5;
  private offset = 0;

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
  ) {}

  ngOnInit() {
    this.usuario.set(this.authService.getUsuario());
    this.cargarPublicaciones(true);
  }

  cambiarOrden(o: OrdenFeed) {
    if (this.orden() === o) return;
    this.orden.set(o);
    this.cargarPublicaciones(true);
  }

  cargarMas() {
    this.cargarPublicaciones(false);
  }

  toggleCrear() {
    const nuevo = !this.mostrarCrear();
    this.mostrarCrear.set(nuevo);
    if (!nuevo) {
      this.textoNueva.set('');
      this.imagenNueva.set(null);
      this.imagenPreview.set(null);
    }
  }

  onTextoNuevaChange(e: Event) {
    this.textoNueva.set((e.target as HTMLTextAreaElement).value);
  }

  onImagenNuevaChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.imagenNueva.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => this.imagenPreview.set((ev.target?.result as string) ?? null);
      reader.readAsDataURL(file);
    } else {
      this.imagenPreview.set(null);
    }
  }

  quitarImagen() {
    this.imagenNueva.set(null);
    this.imagenPreview.set(null);
  }

  crearPublicacion() {
    const texto = this.textoNueva().trim();
    const u = this.usuario();
    if (!texto || !u || this.creando()) return;
    this.creando.set(true);
    this.publicacionesService.crear(texto, u._id, this.imagenNueva() ?? undefined).subscribe({
      next: (pub) => {
        this.publicaciones.update((ps) => [pub, ...ps]);
        this.textoNueva.set('');
        this.imagenNueva.set(null);
        this.imagenPreview.set(null);
        this.mostrarCrear.set(false);
        this.creando.set(false);
      },
      error: () => this.creando.set(false),
    });
  }

  onDelete(id: string) {
    const u = this.usuario();
    if (!u) return;
    this.publicacionesService.eliminar(id, u._id, u.perfil).subscribe({
      next: () => this.publicaciones.update((ps) => ps.filter((p) => p._id !== id)),
    });
  }

  private cargarPublicaciones(resetear: boolean) {
    if (this.cargando()) return;
    if (resetear) {
      this.offset = 0;
      this.publicaciones.set([]);
      this.hayMas.set(true);
    }
    this.cargando.set(true);
    this.publicacionesService
      .listar({ orden: this.orden(), offset: this.offset, limit: this.LIMIT })
      .subscribe({
        next: (pubs) => {
          this.publicaciones.update((ps) => [...ps, ...pubs]);
          this.offset += pubs.length;
          this.hayMas.set(pubs.length === this.LIMIT);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }
}
