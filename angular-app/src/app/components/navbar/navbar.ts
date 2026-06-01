import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  usuario = signal<Usuario | null>(null);
  menuAbierto = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.usuario.set(this.authService.getUsuario());
  }

  iniciales(): string {
    const u = this.usuario();
    if (!u) return '?';
    return `${u.nombre[0]}${u.apellido[0]}`.toUpperCase();
  }

  tieneImagen(): boolean {
    return !!this.usuario()?.imagenPerfil;
  }

  obtenerUrlImagen(): string {
    const u = this.usuario();
    return u?.imagenPerfil ? `http://localhost:3000${u.imagenPerfil}` : '';
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }
}
