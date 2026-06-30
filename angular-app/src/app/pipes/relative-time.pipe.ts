import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    const diff = Date.now() - new Date(value).getTime();
    const seg  = Math.floor(diff / 1000);
    const min  = Math.floor(seg / 60);
    const hr   = Math.floor(min / 60);
    const dia  = Math.floor(hr / 24);
    const sem  = Math.floor(dia / 7);
    const mes  = Math.floor(dia / 30);

    if (seg  <  60) return 'justo ahora';
    if (min  <  60) return `hace ${min}  ${min  === 1 ? 'minuto'  : 'minutos'}`;
    if (hr   <  24) return `hace ${hr}   ${hr   === 1 ? 'hora'    : 'horas'}`;
    if (dia  <   7) return `hace ${dia}  ${dia  === 1 ? 'día'     : 'días'}`;
    if (sem  <   4) return `hace ${sem}  ${sem  === 1 ? 'semana'  : 'semanas'}`;
    if (mes  <  12) return `hace ${mes}  ${mes  === 1 ? 'mes'     : 'meses'}`;
    const anio = Math.floor(dia / 365);
    return `hace ${anio} ${anio === 1 ? 'año' : 'años'}`;
  }
}
