// src/utils/rolInicio.ts
//
// Resolución de inicio por rol: cada rol aterriza en su propio panel.
// Admin → /admin · Operador → /operador · Cliente → /cliente.

export function rutaInicioPorRol(roles: readonly string[]): string {
  if (roles.includes('Admin')) return '/admin';
  if (roles.includes('Operador')) return '/operador';
  if (roles.includes('Cliente')) return '/cliente';
  return '/perfil';
}