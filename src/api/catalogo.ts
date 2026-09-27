// src/api/pokemones.ts
// Ruta de ejemplo del backend. Cada recurso nuevo va en su propio archivo y
// reutiliza el ApiClient (que ya resuelve token + Authorization + errores).

import type { ApiClient } from './client';

export interface Producto {
  id?: number | string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  [key: string]: unknown;
}

export async function listarCatalogo(api: ApiClient): Promise<Producto[]> {
  const raw = await api.get<unknown>('/catalogo');

  if (Array.isArray(raw)) {
    return raw as Producto[];
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    for (const key of ['items', 'data', 'productos', 'catalogo', 'results']) {
      if (Array.isArray(obj[key])) {
        return obj[key] as Producto[];
      }
    }
  }

  return [];
}
