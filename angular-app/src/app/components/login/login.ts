import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  modal = signal<{ visible: boolean; tipo: 'error' | 'exito'; mensaje: string }>(
    { visible: false, tipo: 'error', mensaje: '' },
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      identificador: ['', Validators.required],
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/),
        ],
      ],
    });
  }

  get identificador() { return this.form.get('identificador')!; }
  get contrasena() { return this.form.get('contrasena')!; }

  togglePassword() { this.showPassword.update((v) => !v); }

  cerrarModal() { this.modal.set({ ...this.modal(), visible: false }); }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { identificador, contrasena } = this.form.value;

    this.authService.login(identificador, contrasena).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al iniciar sesión. Verifique sus credenciales.';
        this.modal.set({
          visible: true,
          tipo: 'error',
          mensaje: Array.isArray(msg) ? msg[0] : msg,
        });
      },
    });
  }
}
