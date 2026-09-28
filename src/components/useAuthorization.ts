import { useEffect, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { acquireApiToken } from '../api/client';
import { decodeJwt, rolesOf, scopesOf } from '../utils/jwt';

interface AuthorizationSnapshot {
  accountKey: string;
  roles: string[];
  scopes: string[];
  error: string | null;
}

export function useAuthorization() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() ?? accounts[0] ?? null;
  const accountKey = account?.homeAccountId ?? '';
  const [snapshot, setSnapshot] = useState<AuthorizationSnapshot | null>(null);
  const currentSnapshot = snapshot?.accountKey === accountKey ? snapshot : null;

  useEffect(() => {
    if (!account) return;

    let active = true;

    void acquireApiToken(instance, account)
      .then((token) => {
        const claims = decodeJwt(token);
        if (!claims) throw new Error('Invalid token payload');
        if (active) {
          setSnapshot({
            accountKey,
            roles: rolesOf(claims),
            scopes: scopesOf(claims),
            error: null,
          });
        }
      })
      .catch(() => {
        if (active) {
          setSnapshot({
            accountKey,
            roles: [],
            scopes: [],
            error: 'No fue posible comprobar los permisos de la cuenta.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [account, accountKey, instance]);

  return useMemo(() => {
    const roles = currentSnapshot?.roles ?? [];
    const scopes = currentSnapshot?.scopes ?? [];

    return {
      roles,
      scopes,
      loading: Boolean(account && !currentSnapshot),
      error: currentSnapshot?.error ?? null,
      hasRole: (role: string) => roles.includes(role),
      hasScope: (scope: string) => scopes.includes(scope),
    };
  }, [account, currentSnapshot]);
}