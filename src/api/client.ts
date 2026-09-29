// src/api/client.ts
// Cliente HTTP reutilizable para el backend protegido por API Gateway + JWT authorizer.
// Se encarga de: obtener el access token de Entra (aud = tu API), inyectar el
// header Authorization, y normalizar errores. Añade rutas nuevas en archivos
// hermanos (p.ej. src/api/xxxx.ts) usando este cliente.

import type { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { apiConfig, apiRequest } from '../auth/authConfig';

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(status === 0 ? 'No fue posible conectar con el backend.' : `Error de servicio (${status}).`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class ApiNotConfiguredError extends Error {
  constructor() {
    super('El backend aún no está configurado.');
    this.name = 'ApiNotConfiguredError';
  }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiNotConfiguredError) {
    return error.message;
  }

  if (error instanceof ApiError) {
    if (error.status === 0) return 'No se pudo conectar con el backend. Inténtalo nuevamente más tarde.';
    if (error.status === 401) return 'La sesión no pudo autorizar esta solicitud. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
    if (error.status === 404) return 'No se encontró la información solicitada.';
    if (error.status === 400) return 'La solicitud contiene datos inválidos. Revisa la información e inténtalo nuevamente.';
    if (error.status === 409) return 'La operación entra en conflicto con el estado o las reglas del negocio.';
    if (error.status >= 500) return 'El servicio presenta un problema temporal. Inténtalo más tarde.';
    return 'No se pudo completar la solicitud.';
  }

  return 'No se pudo completar la solicitud. Inténtalo nuevamente.';
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene un access token para el backend (aud = tu API).
 * - Intenta silenciosamente (acquireTokenSilent → usa cache o iframe oculto).
 * - Si falla (consentimiento nuevo, sesión expirada, MFA, o el iframe silencioso
 *   no funciona por bloqueo de cookies de terceros → error `timed_out`),
 *   cae a un redirect interactivo para obtener/consentir el scope de la API.
 *   El redirect recarga la página; al volver, MSAL ya tiene el token en cache.
 */
export async function acquireApiToken(
  instance: IPublicClientApplication,
  account: AccountInfo,
): Promise<string> {
  try {
    const result = await instance.acquireTokenSilent({ ...apiRequest, account });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // No vuelve: la página navega a Entra y regresa al redirectUri.
      await instance.acquireTokenRedirect({ ...apiRequest, account });
    }
    throw error;
  }
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  del<T>(path: string): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export function createApiClient(
  instance: IPublicClientApplication,
  account: AccountInfo,
): ApiClient {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!apiConfig.baseUrl) {
      throw new ApiNotConfiguredError();
    }
    if (apiConfig.scopes.length === 0) {
      throw new Error('VITE_API_SCOPE no está configurado en .env');
    }

    const token = await acquireApiToken(instance, account);
    const url = `${apiConfig.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (init.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch(url, { ...init, headers });
    } catch {
      throw new ApiError(0, 'Network Error', null);
    }

    const text = await response.text();
    const body = text ? safeJson(text) : null;

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, body);
    }
    return body as T;
  }

  return {
    request,
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
