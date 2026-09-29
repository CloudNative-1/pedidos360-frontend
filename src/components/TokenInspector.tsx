// src/components/TokenInspector.tsx
//
// Herramienta de desarrollo para inspeccionar los claims
// del access token obtenido para la API de Pedidos360.

import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

import { acquireApiToken, apiErrorMessage } from '../api/client';

import {
  decodeJwt,
  rolesOf,
  scopesOf,
  type JwtClaims,
} from '../utils/jwt';

export function TokenInspector() {
  const { instance, accounts } = useMsal();

  const [claims, setClaims] =
    useState<JwtClaims | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleInspect = async () => {
    const account =
      instance.getActiveAccount() ??
      accounts[0] ??
      null;

    if (!account) {
      setError(
        'No existe una sesión activa.',
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token =
        await acquireApiToken(
          instance,
          account,
        );

      const decoded =
        decodeJwt(token);

      if (!decoded) {
        setError(
          'No fue posible interpretar el access token.',
        );

        return;
      }

      setClaims(decoded);
      setToken(token);
    } catch (error) {
      setError(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h3>Token de acceso de Pedidos360-API</h3>

      <p className="subtitle">
        Información utilizada para comprobar
        autenticación y autorización.
      </p>

      <button
        className="secondary-button"
        onClick={handleInspect}
        disabled={loading}
      >
        {loading
          ? 'Obteniendo token...'
          : 'Inspeccionar token'}
      </button>

      {error && (
        <p className="inline-error">
          {error}
        </p>
      )}

      {claims && (
        <div className="token-grid">
          <div>
            <span>Audience</span>
            <code>
              {String(
                claims.aud ??
                  'No disponible',
              )}
            </code>
          </div>

          <div>
            <span>Issuer</span>
            <code>
              {String(
                claims.iss ??
                  'No disponible',
              )}
            </code>
          </div>

          <div>
            <span>Scopes</span>
            <code>
              {scopesOf(claims).join(', ') ||
                'Ninguno'}
            </code>
          </div>

          <div>
            <span>Roles</span>
            <code>
              {rolesOf(claims).join(', ') ||
                'Ninguno'}
            </code>
          </div>

          <div>
            <span>Expiración</span>
            <code>
              {claims.exp
                ? new Date(
                    claims.exp * 1000,
                  ).toLocaleString()
                : 'No disponible'}
            </code>
          </div>
        </div>
      )}

      {import.meta.env.DEV && token && (
        <details className="token-details">
          <summary>Mostrar access token completo (solo desarrollo)</summary>
          <pre>{token}</pre>
        </details>
      )}
    </section>
  );
}