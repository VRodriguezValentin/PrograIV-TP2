import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Usuario } from '../../models/usuario';
import { PublicacionData } from '../../models/publicacion-data';
import { CharCounterDirective } from '../../directives/char-counter.directive';

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterOutlet, Navbar, PublicacionComponent, CharCounterDirective],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  usuario = signal<Usuario | null>(null);
  misPublicaciones = signal<PublicacionData[]>([]);
  cargandoPosts = signal(false);

  editando = signal(false);
  guardando = signal(false);
  descripcionEdit = signal('');
  previewUrl = signal<string | null>(null);
  errGuardar = signal('');
  archivoSeleccionado: File | null = null;

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
  ) {}

  ngOnInit() {
    const u = this.authService.getUsuario();
    this.usuario.set(u);
    if (u) this.cargarMisPosts(u);
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
    return (
      day.toString().padStart(2, '0') +
      '/' +
      month.toString().padStart(2, '0') +
      '/' +
      year
    );
  }

  iniciarEdicion() {
    const u = this.usuario();
    this.descripcionEdit.set(u?.descripcion ?? '');
    this.previewUrl.set(null);
    this.archivoSeleccionado = null;
    this.errGuardar.set('');
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
    this.previewUrl.set(null);
    this.archivoSeleccionado = null;
    this.errGuardar.set('');
  }

  onArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.archivoSeleccionado = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardar() {
    if (this.guardando()) return;
    this.guardando.set(true);
    this.errGuardar.set('');

    const fd = new FormData();
    fd.append('descripcion', this.descripcionEdit());
    if (this.archivoSeleccionado) {
      fd.append('imagenPerfil', this.archivoSeleccionado);
    }

    this.authService.actualizarPerfil(fd).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.guardando.set(false);
        this.editando.set(false);
        this.previewUrl.set(null);
        this.archivoSeleccionado = null;
      },
      error: () => {
        this.errGuardar.set('No se pudo guardar. Intentá de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  onDeletePost(id: string) {
    const u = this.usuario();
    if (!u) return;
    this.publicacionesService.eliminar(id, u._id, u.perfil).subscribe({
      next: () => this.misPublicaciones.update((ps) => ps.filter((p) => p._id !== id)),
    });
  }

  private cargarMisPosts(u: Usuario) {
    this.cargandoPosts.set(true);
    this.publicacionesService
      .listar({ usuarioId: u._id, orden: 'fecha', offset: 0, limit: 3 })
      .subscribe({
        next: (pubs) => {
          this.misPublicaciones.set(pubs);
          this.cargandoPosts.set(false);
        },
        error: () => this.cargandoPosts.set(false),
      });
  }
}
