// src/useApi.ts
// Hook que entrega un ApiClient ya ligado a la cuenta MSAL activa.
// Uso:
//   const api = useApi();
//   const data ;

import { useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { createApiClient, type ApiClient } from '../api/client';

export function useApi(): ApiClient | null {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  return useMemo(() => {
    if (!account) return null;
    return createApiClient(instance, account);
  }, [instance, account]);
}
