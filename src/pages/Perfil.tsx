import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { acquireApiToken, apiErrorMessage } from '../api/client';
import { useAuthorization } from '../components/useAuthorization';
import { PageHeader } from '../components/layout/PageHeader';
import { decodeJwt, type JwtClaims } from '../utils/jwt';
import { resolveActiveAccount } from '../auth/activeAccount';

export function Perfil() {
  const { instance, accounts } = useMsal();
  const authorization = useAuthorization();
  const accountKey = resolveActiveAccount(instance, accounts)?.homeAccountId ?? '';
  const [claims, setClaims] = useState<JwtClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountKey) return;

    let active = true;
    const tokenAccount = instance.getAccount({ homeAccountId: accountKey });
    if (!tokenAccount) return;
    void acquireApiToken(instance, tokenAccount)
      .then((token) => {
        if (active) {
          setClaims(decodeJwt(token));
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(apiErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accountKey, instance]);

  const account = accountKey ? instance.getAccount({ homeAccountId: accountKey }) : null;

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Cuenta" title="Mi perfil" subtitle="Información de tu sesión de Microsoft Entra ID." />
      <section className="surface profile-panel" aria-labelledby="profile-account-heading">
        <div className="profile-heading">
          <span className="profile-avatar" aria-hidden="true">
            {account?.name?.trim().charAt(0).toUpperCase() || 'M'}
          </span>
          <div>
            <h2 id="profile-account-heading">{account?.name ?? 'Cuenta autenticada'}</h2>
            <p className="muted-copy">{account?.username ?? 'Correo o usuario no disponible'}</p>
          </div>
        </div>
        <dl className="profile-details">
          <div><dt>Nombre</dt><dd>{account?.name ?? 'No disponible'}</dd></div>
          <div><dt>Correo o usuario</dt><dd>{account?.username ?? 'No disponible'}</dd></div>
          <div><dt>Rol</dt><dd>{authorization.loading ? 'Consultando…' : authorization.roles.join(', ') || 'Sin roles asignados'}</dd></div>
          <div><dt>Scopes de la API</dt><dd>{authorization.loading ? 'Consultando…' : authorization.scopes.join(', ') || 'Sin scopes disponibles'}</dd></div>
        </dl>
        {authorization.error && <p className="inline-error" role="alert">{authorization.error}</p>}
      </section>

      {import.meta.env.DEV && (
        <section className="surface profile-claims" aria-labelledby="profile-claims-heading">
          <h2 id="profile-claims-heading">Diagnóstico de sesión</h2>
          {loading && <p className="muted-copy" role="status">Consultando claims del access token…</p>}
          {error && <p className="inline-error" role="alert">{error}</p>}
          {!loading && !error && claims && (
            <dl className="profile-details profile-details-compact">
              <div><dt>aud</dt><dd>{Array.isArray(claims.aud) ? claims.aud.join(', ') : claims.aud ?? 'No disponible'}</dd></div>
              <div><dt>iss</dt><dd>{claims.iss ?? 'No disponible'}</dd></div>
              <div><dt>exp</dt><dd>{claims.exp ? new Date(claims.exp * 1000).toLocaleString() : 'No disponible'}</dd></div>
            </dl>
          )}
        </section>
      )}
    </section>
  );
}