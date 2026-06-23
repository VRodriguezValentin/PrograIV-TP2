import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';

@Component({
  selector: 'app-cargando',
  imports: [],
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  constructor(
    private authService: AuthService,
    private sessionTimer: SessionTimerService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.autorizar().subscribe({
      next: () => {
        this.sessionTimer.startTimer();
        this.router.navigate(['/publicaciones']);
      },
      error: () => this.router.navigate(['/login']),
    });
  }
}
