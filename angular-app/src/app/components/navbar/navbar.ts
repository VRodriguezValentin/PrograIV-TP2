import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../enviroments/enviroment';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
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

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }
}
