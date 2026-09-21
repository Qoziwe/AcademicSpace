import type { ApiVault, ApiVaultDetail } from '@/mocks/handlers/vaults';

import { apiFetch } from './client';

export function getVaults(): Promise<ApiVault[]> {
  return apiFetch<ApiVault[]>('GET', '/vaults');
}

export function getVault(vaultId: string): Promise<ApiVaultDetail | null> {
  return apiFetch<ApiVaultDetail | null>('GET', `/vaults/${vaultId}`);
}
