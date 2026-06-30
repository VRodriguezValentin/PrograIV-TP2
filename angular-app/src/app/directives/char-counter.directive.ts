import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({ selector: '[charCounter]', standalone: true })
export class CharCounterDirective implements OnInit, OnDestroy {
  @Input('charCounter') limit = 0;

  private counter!: HTMLElement;

  constructor(
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    private r2: Renderer2,
  ) {}

  ngOnInit() {
    this.counter = this.r2.createElement('span');
    this.r2.addClass(this.counter, 'char-counter-badge');

    const parent = this.el.nativeElement.parentNode;
    const next   = this.el.nativeElement.nextSibling;
    this.r2.insertBefore(parent, this.counter, next);

    this.update();
  }

  @HostListener('input')
  onInput() {
    this.update();
  }

  private update() {
    const usado     = this.el.nativeElement.value.length;
    const restantes = this.limit - usado;
    this.r2.setProperty(this.counter, 'textContent', `${usado}/${this.limit}`);

    if (restantes <= 20) {
      this.r2.addClass(this.counter, 'char-counter-badge--warn');
    } else {
      this.r2.removeClass(this.counter, 'char-counter-badge--warn');
    }

    if (restantes < 0) {
      this.r2.addClass(this.counter, 'char-counter-badge--over');
    } else {
      this.r2.removeClass(this.counter, 'char-counter-badge--over');
    }
  }

  ngOnDestroy() {
    this.counter?.parentNode && this.r2.removeChild(this.counter.parentNode, this.counter);
  }
}
