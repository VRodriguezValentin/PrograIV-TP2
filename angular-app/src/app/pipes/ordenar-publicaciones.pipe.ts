import { Pipe, PipeTransform } from '@angular/core';
import { PublicacionData } from '../components/publicacion/publicacion';

@Pipe({
  name: 'ordenarPublicaciones',
  standalone: true,
})
export class OrdenarPublicacionesPipe implements PipeTransform {
  transform(publicaciones: PublicacionData[], orden: 'fecha' | 'meGustas'): PublicacionData[] {
    if (!publicaciones?.length) return [];
    return [...publicaciones].sort((a, b) =>
      orden === 'meGustas'
        ? b.meGustas.length - a.meGustas.length
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
