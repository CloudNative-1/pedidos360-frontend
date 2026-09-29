import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';

const configuredTenantId = import.meta.env.VITE_AZURE_TENANT_ID;

export function resolveActiveAccount(
  instance: IPublicClientApplication,
  accounts: AccountInfo[],
): AccountInfo | null {
  const activeAccount = instance.getActiveAccount();
  if (activeAccount?.tenantId === configuredTenantId) return activeAccount;

  return accounts
    .filter((account) => account.tenantId === configuredTenantId)
    .sort((left, right) =>
      (left.username ?? '').localeCompare(right.username ?? '') ||
      left.homeAccountId.localeCompare(right.homeAccountId),
    )[0] ?? null;
}