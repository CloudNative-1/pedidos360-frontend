// src/auth/RequireRole.tsx
//
// Guard de AUTORIZACIÓN por roles.
//
// RequireAuth comprueba primero que exista una sesión.
// Después RequireRole obtiene el access token de Pedidos360-API,
// lee el claim "roles" y comprueba si el usuario posee al menos
// uno de los roles permitidos para acceder a la ruta.
//
// IMPORTANTE:
// Esta validación mejora la navegación y experiencia del usuario,
// pero NO reemplaza la autorización del backend.
//
// Más adelante:
// API Gateway validará el JWT.
// Python/Lambda validará también los roles necesarios para
// realizar cada operación.

import {
  useEffect,
  useState,
} from 'react';

import { Outlet } from 'react-router-dom';

import { useMsal } from '@azure/msal-react';

import { acquireApiToken } from '../api/client';

import { decodeJwt, rolesOf } from '../utils/jwt';
import { resolveActiveAccount } from './activeAccount';

interface RequireRoleProps {
  roles: readonly string[];
}

type Status =
  | 'loading'
  | 'allowed'
  | 'denied';

export function RequireRole({
  roles,
}: RequireRoleProps) {

  const {
    instance,
    accounts,
  } = useMsal();

  const account = resolveActiveAccount(instance, accounts);
  const accountKey = account?.homeAccountId ?? '';

  const rolesKey = roles.join('\u0000');
  const evaluationKey = `${accountKey}:${rolesKey}`;
  const [evaluation, setEvaluation] = useState<{
    key: string;
    status: Status;
  } | null>(null);
  const status = !account
    ? 'denied'
    : !instance.getAccount({ homeAccountId: accountKey })
      ? 'denied'
    : evaluation?.key === evaluationKey
      ? evaluation.status
      : 'loading';

  useEffect(() => {
    if (!accountKey || !rolesKey) {
      return;
    }

    let cancelled = false;
    const tokenAccount = instance.getAccount({ homeAccountId: accountKey });
    if (!tokenAccount) return;

    const verificarRoles = async () => {
      try {
        const token =
          await acquireApiToken(
            instance,
            tokenAccount,
          );

        if (cancelled) {
          return;
        }

        // Solo se decodifica para consultar los claims.
        // La validación criptográfica será responsabilidad
        // de API Gateway.
        const claims =
          decodeJwt(token);
        const allowedRoles = new Set(rolesKey.split('\u0000'));
        const hasAccess = rolesOf(claims).some((role) =>
          allowedRoles.has(role),
        );

        if (!cancelled) {
          setEvaluation({
            key: evaluationKey,
            status: hasAccess ? 'allowed' : 'denied',
          });
        }
      } catch {
        if (!cancelled) {
          setEvaluation({ key: evaluationKey, status: 'denied' });
        }
      }
    };

    verificarRoles();

    return () => {
      cancelled = true;
    };
  }, [accountKey, evaluationKey, instance, rolesKey]);

  // --------------------------------
  // Verificando autorización
  // --------------------------------

  if (status === 'loading') {
    return (
      <div className="state-panel" role="status">

        <h3>
          Verificando permisos
        </h3>

        <p className="subtitle">
          Estamos comprobando los permisos
          asociados a tu cuenta.
        </p>

      </div>
    );
  }

  // --------------------------------
  // Acceso denegado
  // --------------------------------

  if (status === 'denied') {
    return (
      <div className="state-panel state-error" role="alert">

        <h2>
          Acceso restringido
        </h2>

        <p className="subtitle">
          No fue posible confirmar que tu cuenta tenga acceso a esta sección.
        </p>
        <p className="security-note">
          Esta comprobación controla la experiencia de usuario. La autorización
          real deberá aplicarse en API Gateway y en el backend.
        </p>

      </div>
    );
  }

  // --------------------------------
  // Acceso autorizado
  // --------------------------------

  return <Outlet />;
}