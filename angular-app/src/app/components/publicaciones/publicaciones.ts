import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { InProgress } from '../in-progress/in-progress';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, Navbar, InProgress],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuario = signal<Usuario | null>(null);

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.usuario.set(this.authService.getUsuario());
  }
}
