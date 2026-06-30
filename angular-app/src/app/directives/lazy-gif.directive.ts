import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

const GIF_PLAY_DURATION = 5000;

@Directive({ selector: 'img[lazyGif]', standalone: true })
export class LazyGifDirective implements OnInit, OnDestroy {
  @Input('lazyGif') src = '';

  private canvas: HTMLCanvasElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isGif = false;

  constructor(private el: ElementRef<HTMLImageElement>, private r2: Renderer2) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    this.isGif = /\.gif(\?.*)?$/i.test(this.src);

    if (!this.isGif) {
      // no es gif: se comporta como un [src] normal
      img.src = this.src;
      return;
    }

    this.setupGif(img);
  }

  // ─── Setup ──────────────────────────────────────────────────────────────────

  private setupGif(img: HTMLImageElement) {
    // Crea canvas hermano con la misma clase CSS (hereda border-radius, tamaño, etc.)
    this.canvas = this.r2.createElement('canvas') as HTMLCanvasElement;
    this.canvas.className = img.className;
    this.r2.setStyle(this.canvas, 'display', 'none');
    this.r2.setStyle(this.canvas, 'cursor', 'pointer');

    // Lo inserta justo después del img en el DOM
    const parent = img.parentNode!;
    this.r2.insertBefore(parent, this.canvas, img.nextSibling);

    // Carga el gif — { once: true } evita que reaccione a resets del src posteriores
    img.addEventListener('load', () => {
      // requestAnimationFrame garantiza que el browser ya calculó las dimensiones del img
      requestAnimationFrame(() => {
        this.captureFrame();   // dibuja primer frame en canvas
        this.r2.setStyle(img, 'display', 'none');      // oculta img animado
        this.r2.setStyle(this.canvas, 'display', ''); // muestra canvas estático
      });
    }, { once: true });

    img.src = this.src;
  }

  // ─── Captura un frame del img al canvas ─────────────────────────────────────

  private captureFrame() {
    const img    = this.el.nativeElement;
    const canvas = this.canvas!;

    // Obtiene las dimensiones renderizadas del img (funciona mientras img está visible)
    const w = img.offsetWidth  || img.naturalWidth;
    const h = img.offsetHeight || img.naturalHeight;
    if (!w || !h) return;

    const dpr = window.devicePixelRatio || 1;

    // Buffer interno del canvas (alta resolución en pantallas Retina)
    canvas.width  = w * dpr;
    canvas.height = h * dpr;

    // Tamaño visual que ve el usuario
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Dibuja con lógica de object-fit: cover (recorta y centra como haría el CSS)
    const iw    = img.naturalWidth;
    const ih    = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const sw    = iw * scale;
    const sh    = ih * scale;
    const x     = (w - sw) / 2;
    const y     = (h - sh) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, x, y, sw, sh);
  }

  // ─── Eventos de mouse ───────────────────────────────────────────────────────

  @HostListener('mouseenter')
  onImgEnter() {
    if (!this.isGif) return;
    this.play();
  }

  // El canvas también tiene que responder al hover porque es el elemento visible
  ngAfterViewInit?(): void {}

  // ─── Lógica play / freeze ───────────────────────────────────────────────────

  private play() {
    if (this.timer) clearTimeout(this.timer); // resetea el timer si ya estaba corriendo

    const img = this.el.nativeElement;

    // Muestra img (gif se anima), oculta canvas estático
    this.r2.setStyle(this.canvas, 'display', 'none');
    this.r2.setStyle(img, 'display', '');

    // Congela después de 5 segundos
    this.timer = setTimeout(() => this.freeze(), GIF_PLAY_DURATION);
  }

  private freeze() {
    this.timer = null;
    const img = this.el.nativeElement;

    // El img está visible: captura el frame actual
    this.captureFrame();

    // Vuelve al canvas estático
    this.r2.setStyle(img, 'display', 'none');
    this.r2.setStyle(this.canvas, 'display', '');
  }

  // ─── Limpieza ───────────────────────────────────────────────────────────────

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
    if (this.canvas?.parentNode) {
      this.r2.removeChild(this.canvas.parentNode, this.canvas);
    }
  }
}
