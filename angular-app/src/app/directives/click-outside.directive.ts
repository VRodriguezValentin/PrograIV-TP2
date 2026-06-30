import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: '[clickOutside]', standalone: true })
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null) {
    if (target instanceof Node && !this.el.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
