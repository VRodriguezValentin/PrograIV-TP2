import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import ApexCharts from 'apexcharts';

function contrasenasIguales(control: AbstractControl): ValidationErrors | null {
  const contra = control.get('contrasena');
  const rep = control.get('repetirContrasena');
  if (contra && rep && contra.value !== rep.value) return { contrasenasNoCoinciden: true };
  return null;
}

function validarFechaNacimiento(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  const hoy = new Date();
  if (fecha > hoy) return { fechaFutura: true };
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth(), mN = fecha.getMonth(), d = hoy.getDate(), dN = fecha.getDate();
  if (m < mN || (m === mN && d < dN)) edad--;
  if (edad < 18) return { menorDeEdad: true };
  if (edad > 100) return { mayorA100Anios: true };
  return null;
}
import { Navbar } from '../navbar/navbar';
import { DashboardService } from '../../services/dashboard.service';
import { UsuarioAdmin } from '../../models/usuario-admin';
import { FilterTablePipe } from '../../pipes/filter-table.pipe';
import { CharCounterDirective } from '../../directives/char-counter.directive';

type Periodo = 'dia' | 'semana' | 'mes';
type Tab = 'usuarios' | 'estadisticas';
const CHART_COLORS = ['#00d4ff', '#8b2fff', '#ff0080', '#00ff8c', '#ffcc00'];
const CHART_BASE = {
  theme: { mode: 'dark' as const },
  chart: { background: 'transparent', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: CHART_COLORS,
  grid: { borderColor: 'rgba(255,255,255,0.07)' },
};

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, ReactiveFormsModule, FilterTablePipe, CharCounterDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  activeTab = signal<Tab>('usuarios');

  usuarios = signal<UsuarioAdmin[]>([]);
  cargandoUsuarios = signal(false);
  mostrarFormCrear = signal(false);
  creandoUsuario = signal(false);
  showPass = signal(false);
  showPassRepeat = signal(false);
  previewUrl = signal<string | null>(null);
  archivoSeleccionado: File | null = null;

  alertaVisible = signal(false);
  alertaTipo = signal<'exito' | 'error' | 'warn'>('exito');
  alertaMensaje = signal('');

  formCrear!: FormGroup;

  busqueda = signal('');

  periodoBar = signal<Periodo>('semana');
  periodoLine = signal<Periodo>('semana');
  periodoPie = signal<Periodo>('semana');

  private chartBar: ApexCharts | null = null;
  private chartLine: ApexCharts | null = null;
  private chartPie: ApexCharts | null = null;

  constructor(private dashboardService: DashboardService, private fb: FormBuilder) {}

  ngOnInit() {
    this.formCrear = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
      repetirContrasena: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, validarFechaNacimiento]],
      descripcion: ['', Validators.maxLength(200)],
      perfil: ['usuario', Validators.required],
    }, { validators: contrasenasIguales });
    this.cargarUsuarios();
  }

  ngOnDestroy() {
    this.chartBar?.destroy();
    this.chartLine?.destroy();
    this.chartPie?.destroy();
  }

  get mismatch() { return this.formCrear.errors?.['contrasenasNoCoinciden'] && this.formCrear.get('repetirContrasena')?.touched; }

  cambiarTab(tab: Tab) {
    if (this.activeTab() === 'estadisticas' && tab !== 'estadisticas') {
      this.chartBar?.destroy(); this.chartBar = null;
      this.chartLine?.destroy(); this.chartLine = null;
      this.chartPie?.destroy(); this.chartPie = null;
    }
    this.activeTab.set(tab);
    if (tab === 'estadisticas') {
      setTimeout(() => this.inicializarGraficos(), 30);
    }
  }

  cargarUsuarios() {
    this.cargandoUsuarios.set(true);
    this.dashboardService.listarUsuarios().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargandoUsuarios.set(false);
      },
      error: () => this.cargandoUsuarios.set(false),
    });
  }

  toggleFormCrear() {
    const visible = !this.mostrarFormCrear();
    this.mostrarFormCrear.set(visible);
    if (!visible) {
      this.formCrear.reset({ perfil: 'usuario' });
      this.archivoSeleccionado = null;
      this.previewUrl.set(null);
    }
  }

  onArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.archivoSeleccionado = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  crearUsuario() {
    if (this.formCrear.invalid || this.creandoUsuario()) return;
    this.creandoUsuario.set(true);
    const v = this.formCrear.value;

    const data = new FormData();
    data.append('nombre', v.nombre.trim());
    data.append('apellido', v.apellido.trim());
    data.append('correo', v.correo.trim());
    data.append('nombreUsuario', v.nombreUsuario.trim());
    data.append('contrasena', v.contrasena);
    data.append('fechaNacimiento', v.fechaNacimiento);
    data.append('descripcion', v.descripcion?.trim() || '');
    data.append('perfil', v.perfil);
    if (this.archivoSeleccionado) data.append('imagenPerfil', this.archivoSeleccionado);

    this.dashboardService.crearUsuario(data).subscribe({
      next: (nuevo) => {
        this.usuarios.update((lista) => [nuevo, ...lista]);
        this.formCrear.reset({ perfil: 'usuario' });
        this.archivoSeleccionado = null;
        this.previewUrl.set(null);
        this.mostrarFormCrear.set(false);
        this.creandoUsuario.set(false);
        this.mostrarAlerta('exito', 'Usuario creado correctamente.');
      },
      error: (err) => {
        this.creandoUsuario.set(false);
        const msg = err?.error?.message ?? 'Error al crear usuario.';
        this.mostrarAlerta('error', Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }

  deshabilitar(u: UsuarioAdmin) {
    if (u.perfil === 'administrador') {
      this.mostrarAlerta('warn', 'No podés deshabilitar a otro administrador.');
      return;
    }
    this.dashboardService.deshabilitarUsuario(u._id).subscribe({
      next: () => this.usuarios.update((lista) => lista.map((x) => (x._id === u._id ? { ...x, activo: false } : x))),
      error: (err) => this.mostrarAlerta('error', err?.error?.message ?? 'Error al deshabilitar usuario.'),
    });
  }

  habilitar(u: UsuarioAdmin) {
    this.dashboardService.habilitarUsuario(u._id).subscribe({
      next: () => this.usuarios.update((lista) => lista.map((x) => (x._id === u._id ? { ...x, activo: true } : x))),
      error: (err) => this.mostrarAlerta('error', err?.error?.message ?? 'Error al habilitar usuario.'),
    });
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const [y, m, d] = fecha.toString().split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }

  private mostrarAlerta(tipo: 'exito' | 'error' | 'warn', mensaje: string) {
    this.alertaTipo.set(tipo);
    this.alertaMensaje.set(mensaje);
    this.alertaVisible.set(true);
    setTimeout(() => this.alertaVisible.set(false), 5000);
  }

  cambiarPeriodo(chart: 'bar' | 'line' | 'pie', periodo: Periodo) {
    if (chart === 'bar') { this.periodoBar.set(periodo); this.cargarBar(); }
    if (chart === 'line') { this.periodoLine.set(periodo); this.cargarLine(); }
    if (chart === 'pie') { this.periodoPie.set(periodo); this.cargarPie(); }
  }

  private async inicializarGraficos() {
    const el = (id: string) => document.getElementById(id);

    if (!this.chartBar) {
      const node = el('chart-bar');
      if (node) {
        this.chartBar = new ApexCharts(node, {
          ...CHART_BASE,
          chart: { ...CHART_BASE.chart, type: 'bar', height: 300 },
          series: [],
          xaxis: { categories: [] },
          dataLabels: { enabled: false },
          plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        });
        await this.chartBar.render();
      }
    }

    if (!this.chartLine) {
      const node = el('chart-line');
      if (node) {
        this.chartLine = new ApexCharts(node, {
          ...CHART_BASE,
          chart: { ...CHART_BASE.chart, type: 'line', height: 300 },
          series: [],
          xaxis: { categories: [] },
          stroke: { curve: 'smooth', width: 2 },
          markers: { size: 4 },
          dataLabels: { enabled: false },
        });
        await this.chartLine.render();
      }
    }

    if (!this.chartPie) {
      const node = el('chart-pie');
      if (node) {
        this.chartPie = new ApexCharts(node, {
          ...CHART_BASE,
          chart: { ...CHART_BASE.chart, type: 'pie', height: 340 },
          series: [],
          labels: [],
          legend: { position: 'bottom', fontSize: '12px' },
        });
        await this.chartPie.render();
      }
    }

    this.cargarBar();
    this.cargarLine();
    this.cargarPie();
  }

  private cargarBar() {
    this.dashboardService.publicacionesPorUsuario(this.periodoBar()).subscribe({
      next: (data) => {
        this.chartBar?.updateOptions({
          series: [{ name: 'Publicaciones', data: data.map((d) => d.cantidad) }],
          xaxis: { categories: data.map((d) => d.nombreUsuario) },
        });
      },
    });
  }

  private cargarLine() {
    this.dashboardService.comentariosEnTiempo(this.periodoLine()).subscribe({
      next: (data) => {
        this.chartLine?.updateOptions({
          series: [{ name: 'Comentarios', data: data.map((d) => d.cantidad) }],
          xaxis: { categories: data.map((d) => d.fecha) },
        });
      },
    });
  }

  private cargarPie() {
    this.dashboardService.comentariosPorPublicacion(this.periodoPie()).subscribe({
      next: (data) => {
        this.chartPie?.updateOptions({
          series: data.map((d) => d.cantidad),
          labels: data.map((d) => (d.titulo.length > 30 ? d.titulo.substring(0, 30) + '…' : d.titulo)),
        });
      },
    });
  }
}
