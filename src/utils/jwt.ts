// src/utils/jwt.ts
//
// Utilidades para leer el contenido de un JWT.
//
// IMPORTANTE:
// Este archivo solamente decodifica el payload.
// NO verifica la firma ni determina si el token es legítimo.
// Esa validación corresponde al JWT Authorizer de API Gateway
// y posteriormente al backend cuando sea necesario.

export interface JwtClaims {
  aud?: string | string[];
  iss?: string;
  sub?: string;

  scp?: string;
  roles?: string[] | string;

  exp?: number;
  iat?: number;

  [key: string]: unknown;
}

export function decodeJwt(
  token: string,
): JwtClaims | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded =
      normalized.padEnd(
        normalized.length +
          ((4 - (normalized.length % 4)) %
            4),
        '=',
      );

    const decoded =
      atob(padded);

    const json = decodeURIComponent(
      Array.from(decoded)
        .map(
          (char) =>
            `%${char
              .charCodeAt(0)
              .toString(16)
              .padStart(2, '0')}`,
        )
        .join(''),
    );

    return JSON.parse(
      json,
    ) as JwtClaims;
  } catch {
    return null;
  }
}

export function scopesOf(
  claims: JwtClaims | null,
): string[] {
  if (!claims?.scp) {
    return [];
  }

  return claims.scp
    .split(' ')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function rolesOf(
  claims: JwtClaims | null,
): string[] {
  const roles = claims?.roles;
  if (Array.isArray(roles)) return roles.filter((role) => typeof role === 'string');
  return typeof roles === 'string' ? roles.split(/[ ,]+/).filter(Boolean) : [];
}