// src/useApi.ts
// Hook que entrega un ApiClient ya ligado a la cuenta MSAL activa.
// Uso:
//   const api = useApi();
//   const data ;

import { useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { createApiClient, type ApiClient } from '../api/client';
import { resolveActiveAccount } from '../auth/activeAccount';

export function useApi(): ApiClient | null {
  const { instance, accounts } = useMsal();
  const account = resolveActiveAccount(instance, accounts);
  const accountKey = account?.homeAccountId ?? '';

  return useMemo(() => {
    if (!accountKey) return null;
    const tokenAccount = instance.getAccount({ homeAccountId: accountKey });
    return tokenAccount ? createApiClient(instance, tokenAccount) : null;
  }, [instance, accountKey]);
}
