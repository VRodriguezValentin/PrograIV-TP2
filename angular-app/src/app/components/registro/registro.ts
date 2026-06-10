import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

function contrasenasIguales(control: AbstractControl): ValidationErrors | null {
  const contra = control.get('contrasena');
  const repetirContra = control.get('repetirContrasena');
  if (contra && repetirContra && contra.value !== repetirContra.value) return { contrasenasNoCoinciden: true };
  return null;
}

function validarFechaNacimiento(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const fecha = new Date(control.value);
  const hoy = new Date();

  if (fecha > hoy) return { fechaFutura: true };

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fecha.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = fecha.getDate();

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }

  if (edad < 18) return { menorDeEdad: true };

  if (edad > 100) return { mayorA100Años: true };

  return null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  form: FormGroup;
  loading = signal(false);
  showPw = signal(false);
  showPwRepeat = signal(false);
  previewUrl = signal<string | null>(null);
  archivoSeleccionado: File | null = null;

  modal = signal<{ visible: boolean; tipo: 'exito' | 'error'; mensaje: string }>(
    { visible: false, tipo: 'error', mensaje: '' },
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        correo: ['', [Validators.required, Validators.email]],
        nombreUsuario: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        contrasena: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/),
          ],
        ],
        repetirContrasena: ['', Validators.required],
        fechaNacimiento: ['', [Validators.required, validarFechaNacimiento]],
        descripcion: [''],
        perfil: ['usuario'],
      },
      { validators: contrasenasIguales },
    );
  }

  get f() { return this.form.controls; }
  get mismatch() { return this.form.errors?.['contrasenasNoCoinciden'] && this.f['repetirContrasena'].touched; }

  togglePw() { this.showPw.update((v) => !v); }
  togglePwRepeat() { this.showPwRepeat.update((v) => !v); }

  onArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.archivoSeleccionado = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  cerrarModal() {
    const tipo = this.modal().tipo;
    this.modal.set({ ...this.modal(), visible: false });
    if (tipo === 'exito') this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const v = this.form.value;

    const formData = new FormData();
    formData.append('nombre', v.nombre);
    formData.append('apellido', v.apellido);
    formData.append('correo', v.correo);
    formData.append('nombreUsuario', v.nombreUsuario);
    formData.append('contrasena', v.contrasena);
    formData.append('fechaNacimiento', v.fechaNacimiento);
    formData.append('descripcion', v.descripcion || '');
    formData.append('perfil', v.perfil);
    if (this.archivoSeleccionado) {
      formData.append('imagenPerfil', this.archivoSeleccionado);
    }

    this.authService.registro(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.modal.set({
          visible: true,
          tipo: 'exito',
          mensaje: '¡Tu cuenta fue creada exitosamente! Ahora podés iniciar sesión.',
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Error al registrarse. Intentá de nuevo.';
        this.modal.set({
          visible: true,
          tipo: 'error',
          mensaje: Array.isArray(msg) ? msg[0] : msg,
        });
      },
    });
  }
}
