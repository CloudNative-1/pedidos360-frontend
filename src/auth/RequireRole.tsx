// src/RequireRole.tsx
// Guard de AUTORIZACIÓN a nivel de ruta. Se anida DENTRO de <RequireAuth/> en
// App.tsx, así que cuando este guard corre ya sabemos que hay sesión activa —
// solo falta decidir si el usuario tiene el permiso para esta sección.
//
// El claim "roles" de App Roles vive en el ACCESS TOKEN de la API (aud = tu
// backend), no en el ID token del login — por eso pedimos el mismo token que
// usa el resto del backend (acquireApiToken) y leemos sus claims, en vez de
// mirar accounts[0].idTokenClaims (que no lo trae).
//
// Importante: esto SOLO oculta la vista en el navegador — es UX, no
// seguridad. Un usuario podría llamar la API directamente sin pasar por este
// guard, así que la Lambda debe volver a validar el rol con el mismo claim
// (ver la guía, sección 8).
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { acquireApiToken } from '../api/client';
import { decodeJwt } from '../utils/jwt';

interface RequireRoleProps {
  role: string;
}

type Status = 'loading' | 'allowed' | 'denied';

export function RequireRole({ role }: RequireRoleProps) {
  const { instance, accounts } = useMsal();
  const account = accounts[0] ?? instance.getActiveAccount();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    // RequireAuth (el guard padre) ya garantiza que hay cuenta activa antes
    // de llegar acá; el chequeo es solo defensivo.
    if (!account) return;

    let cancelled = false;
    acquireApiToken(instance, account)
      .then((token) => {
        if (cancelled) return;
        const claims = decodeJwt(token);
        const roles = claims?.roles ?? [];
        setStatus(roles.includes(role) ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!cancelled) setStatus('denied');
      });

    return () => {
      cancelled = true;
    };
  }, [instance, account, role]);

  if (!account || status === 'loading') {
    return (
      <div className="card text-center">
        <p>Verificando permisos…</p>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="card text-center">
        <h2>Acceso restringido</h2>
        <p className="subtitle">
          Esta sección requiere el App Role <code>{role}</code> en la API.
          Pídele a un admin del tenant que te lo asigne en Entra ID
          (Enterprise applications → tu API → Users and groups).
        </p>
      </div>
    );
  }

  return <Outlet />;
}
