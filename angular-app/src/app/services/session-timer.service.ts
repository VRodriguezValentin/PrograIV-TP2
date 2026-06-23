import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  mostrarModal = signal(false);

  private warningTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  startTimer() {
    this.clearTimer();
    this.warningTimer = setTimeout(() => {
      this.mostrarModal.set(true);
    }, 30 * 1000);
  }

  extender() {
    this.authService.refrescar().subscribe({
      next: () => {
        this.mostrarModal.set(false);
        this.startTimer();
      },
      error: () => {
        this.mostrarModal.set(false);
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  clearTimer() {
    if (this.warningTimer !== null) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }
}
