import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

// Cuántos ms se reproduce el gif antes de volver a la imagen estática
const GIF_PLAY_MS = 5000;

@Directive({ selector: 'img[lazyGif]', standalone: true })
export class LazyGifDirective implements OnInit, OnDestroy {
  @Input('lazyGif') src = '';

  private canvas: HTMLCanvasElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isGif = false;
  private unlistenCanvas?: () => void;

  constructor(private el: ElementRef<HTMLImageElement>, private r2: Renderer2) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    this.isGif = /\.gif(\?.*)?$/i.test(this.src);

    if (!this.isGif) {
      img.src = this.src;
      return;
    }

    this.setupGif(img);
  }

  private setupGif(img: HTMLImageElement) {
    // Creamos un <canvas> con la misma clase que el <img> para que herede
    // el mismo tamaño y border-radius definidos en el CSS
    this.canvas = this.r2.createElement('canvas') as HTMLCanvasElement;
    this.canvas.className = img.className;
    this.r2.setStyle(this.canvas, 'display', 'none');
    this.r2.setStyle(this.canvas, 'cursor', 'pointer');

    // Lo ponemos justo después del img en el DOM (van a convivir como hermanos)
    this.r2.insertBefore(img.parentNode!, this.canvas, img.nextSibling);

    // El hover va en el canvas porque es el que el usuario ve,
    // el img queda oculto en display:none la mayor parte del tiempo
    this.unlistenCanvas = this.r2.listen(this.canvas, 'mouseenter', () => this.play());

    // Una vez que el gif cargó, sacamos el primer frame al canvas y ocultamos el img
    img.addEventListener('load', () => {
      requestAnimationFrame(() => {
        this.captureFrame();
        this.r2.setStyle(img, 'display', 'none');
        this.r2.setStyle(this.canvas, 'display', '');
      });
    }, { once: true });

    // crossOrigin tiene que ir ANTES de asignar src, si no el canvas queda bloqueado
    // por política de seguridad del navegador (las imágenes son de Cloudinary)
    img.crossOrigin = 'anonymous';
    img.src = this.src;
  }

  private captureFrame() {
    const img    = this.el.nativeElement;
    const canvas = this.canvas!;

    const w = img.offsetWidth  || img.naturalWidth;
    const h = img.offsetHeight || img.naturalHeight;
    if (!w || !h) return;

    // En pantallas el dpr es 2, así la imagen no queda pixelada
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Replicamos el comportamiento de object-fit: cover a mano,
    // porque esa propiedad CSS no aplica a canvas
    const iw    = img.naturalWidth;
    const ih    = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const sw    = iw * scale;
    const sh    = ih * scale;
    const dx    = (w - sw) / 2;
    const dy    = (h - sh) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, sw, sh);
  }

  private play() {
    // Si el usuario vuelve a hacer hover antes de que terminen los 5s,
    // reseteamos el timer para que cuente desde cero de nuevo
    if (this.timer) clearTimeout(this.timer);

    const img = this.el.nativeElement;
    this.r2.setStyle(this.canvas, 'display', 'none');
    this.r2.setStyle(img, 'display', '');

    this.timer = setTimeout(() => this.freeze(), GIF_PLAY_MS);
  }

  private freeze() {
    this.timer = null;
    const img = this.el.nativeElement;

    // Aprovechamos que el img todavía está visible para capturar el frame actual
    this.captureFrame();
    this.r2.setStyle(img, 'display', 'none');
    this.r2.setStyle(this.canvas, 'display', '');
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
    this.unlistenCanvas?.();
    if (this.canvas?.parentNode) {
      this.r2.removeChild(this.canvas.parentNode, this.canvas);
    }
  }
}
