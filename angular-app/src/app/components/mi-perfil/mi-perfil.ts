import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PublicacionComponent } from '../publicacion/publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Usuario } from '../../models/usuario';
import { PublicacionData } from '../../models/publicacion-data';

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterOutlet, Navbar, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  usuario = signal<Usuario | null>(null);
  misPublicaciones = signal<PublicacionData[]>([]);
  cargandoPosts = signal(false);

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
