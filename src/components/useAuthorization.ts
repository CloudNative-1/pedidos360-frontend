import { useCallback, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { acquireApiToken } from '../api/client';
import { decodeJwt, rolesOf, scopesOf } from '../utils/jwt';
import { resolveActiveAccount } from '../auth/activeAccount';

const EMPTY_AUTHORIZATION = { roles: [] as string[], scopes: [] as string[] };

interface AuthorizationSnapshot {
  accountKey: string;
  roles: string[];
  scopes: string[];
  error: string | null;
}

export function useAuthorization() {
  const { instance, accounts } = useMsal();
  const account = resolveActiveAccount(instance, accounts);
  const accountKey = account?.homeAccountId ?? '';
  const [snapshot, setSnapshot] = useState<AuthorizationSnapshot | null>(null);
  const currentSnapshot = snapshot?.accountKey === accountKey ? snapshot : null;

  useEffect(() => {
    if (!accountKey) return;

    let active = true;
    const tokenAccount = instance.getAccount({ homeAccountId: accountKey });
    if (!tokenAccount) return;

    void acquireApiToken(instance, tokenAccount)
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
  }, [accountKey, instance]);

  const roles = currentSnapshot?.roles ?? EMPTY_AUTHORIZATION.roles;
  const scopes = currentSnapshot?.scopes ?? EMPTY_AUTHORIZATION.scopes;
  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);
  const hasScope = useCallback((scope: string) => scopes.includes(scope), [scopes]);

  return {
    roles,
    scopes,
    loading: Boolean(accountKey && !currentSnapshot),
    error: currentSnapshot?.error ?? null,
    hasRole,
    hasScope,
  };
}