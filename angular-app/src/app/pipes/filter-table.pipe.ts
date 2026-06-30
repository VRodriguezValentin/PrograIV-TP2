import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterTable', standalone: true })
export class FilterTablePipe implements PipeTransform {
  transform<T extends Record<string, any>>(items: T[], query: string, fields: (keyof T)[]): T[] {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      fields.some(field => String(item[field] ?? '').toLowerCase().includes(q)),
    );
  }
}
