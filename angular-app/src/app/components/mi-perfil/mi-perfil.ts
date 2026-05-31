import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { InProgress } from '../in-progress/in-progress';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, Navbar, InProgress],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  usuario = signal<Usuario | null>(null);
  readonly API_URL = 'http://localhost:3000';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.usuario.set(this.authService.getUsuario());
  }

  iniciales(): string {
    const u = this.usuario();
    if (!u) return '?';
    return `${u.nombre[0]}${u.apellido[0]}`.toUpperCase();
  }
}
