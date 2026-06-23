import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionTimerService } from './services/session-timer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(readonly sessionTimer: SessionTimerService) {}

  extenderSesion() {
    this.sessionTimer.extender();
  }

  cerrarModal() {
    this.sessionTimer.cerrarModal();
  }
}
