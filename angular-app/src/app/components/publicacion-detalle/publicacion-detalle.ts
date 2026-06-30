import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { PublicacionData } from '../../models/publicacion-data';
import { ComentarioData } from '../../models/comentario-data';
import { Usuario } from '../../models/usuario';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { LazyGifDirective } from '../../directives/lazy-gif.directive';
import { CharCounterDirective } from '../../directives/char-counter.directive';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [RelativeTimePipe, LazyGifDirective, CharCounterDirective],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit, OnDestroy {
  pub = signal<PublicacionData | null>(null);
  cargando = signal(true);
  errorMsg = signal<string | null>(null);

  usuario = signal<Usuario | null>(null);

  likeDado = signal(false);
  cantLikes = signal(0);

  comentarios = signal<ComentarioData[]>([]);
  comentariosTotales = signal(0);
  cargandoComentarios = signal(false);
  hayMas = signal(false);
  textoComentario = signal('');
  enviandoComentario = signal(false);

  editandoId = signal<string | null>(null);
  textoEditado = signal('');
  guardandoEdit = signal(false);

  private comentariosOffset = 0;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private publicacionesService: PublicacionesService ) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    this.usuario.set(this.authService.getUsuario());
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargarPublicacion(id);
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape')
  cerrarModal() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
  }

  esMiComentario(c: ComentarioData): boolean {
    return c.usuario._id === this.usuario()?._id;
  }

  toggleLike() {
    const pub = this.pub();
    const u = this.usuario();
    if (!pub || !u) return;
    const liked = !this.likeDado();
    this.likeDado.set(liked);
    this.cantLikes.update((v) => (liked ? v + 1 : v - 1));
    const accion = liked
      ? this.publicacionesService.darMeGusta(pub._id, u._id)
      : this.publicacionesService.quitarMeGusta(pub._id, u._id);
    accion.subscribe({
      error: () => {
        this.likeDado.set(!liked);
        this.cantLikes.update((v) => (liked ? v - 1 : v + 1));
      },
    });
  }

  cargarMas() {
    this.cargarComentarios(false);
  }

  onInputComentario(e: Event) {
    this.textoComentario.set((e.target as HTMLTextAreaElement).value);
  }

  enviarComentario() {
    const pub = this.pub();
    const u = this.usuario();
    const texto = this.textoComentario().trim();
    if (!pub || !u || !texto || this.enviandoComentario()) return;
    this.enviandoComentario.set(true);
    this.publicacionesService
      .agregarComentario(pub._id, {
        usuarioId: u._id,
        nombreUsuario: u.nombreUsuario,
        imagenPerfil: u.imagenPerfil,
        texto,
      })
      .subscribe({
        next: (comentario) => {
          this.comentarios.update((cs) => [...cs, comentario]);
          this.comentariosTotales.update((v) => v + 1);
          this.textoComentario.set('');
          this.enviandoComentario.set(false);
        },
        error: () => this.enviandoComentario.set(false),
      });
  }

  iniciarEdit(c: ComentarioData) {
    this.editandoId.set(c._id);
    this.textoEditado.set(c.texto);
  }

  cancelarEdit() {
    this.editandoId.set(null);
    this.textoEditado.set('');
  }

  onInputEdit(e: Event) {
    this.textoEditado.set((e.target as HTMLTextAreaElement).value);
  }

  guardarEdit(c: ComentarioData) {
    const pub = this.pub();
    const u = this.usuario();
    const texto = this.textoEditado().trim();
    if (!pub || !u || !texto || this.guardandoEdit()) return;
    this.guardandoEdit.set(true);
    this.publicacionesService
      .editarComentario(pub._id, c._id, texto, u._id)
      .subscribe({
        next: () => {
          this.comentarios.update((cs) =>
            cs.map((x) => (x._id === c._id ? { ...x, texto, modificado: true } : x)),
          );
          this.cancelarEdit();
          this.guardandoEdit.set(false);
        },
        error: () => this.guardandoEdit.set(false),
      });
  }

  private cargarPublicacion(id: string) {
    this.cargando.set(true);
    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (pub) => {
        this.pub.set(pub);
        this.likeDado.set(pub.meGustas.includes(this.usuario()?._id ?? ''));
        this.cantLikes.set(pub.meGustas.length);
        this.comentariosTotales.set(pub.comentariosTotales ?? 0);
        this.cargando.set(false);
        this.cargarComentarios(true);
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar la publicación.');
        this.cargando.set(false);
      },
    });
  }

  private cargarComentarios(resetear: boolean) {
    if (this.cargandoComentarios()) return;
    const pub = this.pub();
    if (!pub) return;
    if (resetear) {
      this.comentariosOffset = 0;
      this.comentarios.set([]);
    }
    this.cargandoComentarios.set(true);
    this.publicacionesService
      .obtenerComentarios(pub._id, this.comentariosOffset, 5)
      .subscribe({
        next: (res) => {
          this.comentarios.update((cs) => [...cs, ...res.comentarios]);
          this.comentariosOffset += res.comentarios.length;
          this.hayMas.set(this.comentariosOffset < res.total);
          this.comentariosTotales.set(res.total);
          this.cargandoComentarios.set(false);
        },
        error: () => this.cargandoComentarios.set(false),
      });
  }
}
