import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';

// Resolución de la cuenta activa de MSAL.
//
// Reglas (matriz de cierre):
// 1. Si MSAL ya tiene una cuenta activa marcada (getActiveAccount),
//    esa es la que se usa. Es la que acaba de completar LOGIN_SUCCESS
//    o la que se guardó en el cache de la sesión.
// 2. Si solo existe una cuenta en el cache, se puede usar sin ambigüedad.
// 3. Si existen varias cuentas y ninguna está marcada como activa,
//    NO se elige arbitrariamente la primera: se devuelve null y la
//    aplicación espera una selección explícita del usuario.

export function resolveActiveAccount(
  instance: IPublicClientApplication,
  accounts: AccountInfo[],
): AccountInfo | null {
  const activeAccount = instance.getActiveAccount();

  if (activeAccount?.tenantId) {
    return activeAccount;
  }

  if (accounts.length === 1) {
    return accounts[0];
  }

  return null;
}